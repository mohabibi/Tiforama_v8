import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import 'dart:math';
import 'package:audioplayers/audioplayers.dart';
import 'package:path_provider/path_provider.dart';
import 'package:logging/logging.dart' as logging;
import './time_manager.dart'; // Importation du fichier TimeManager

final _logger = logging.Logger('SecondPage');

class SecondPage extends StatefulWidget {
  final Map<String, dynamic>? currentData;
  final bool showPaletteMode;
  final bool isSlideshow;

  const SecondPage({
    super.key,
    required this.currentData,
    required this.showPaletteMode,
    required this.isSlideshow,
  });

  @override
  State<SecondPage> createState() => _SecondPageState();
}

class _SecondPageState extends State<SecondPage> {
  final AudioPlayer countdownPlayer = AudioPlayer();
  final AudioPlayer nextPlayer = AudioPlayer();
  final AudioPlayer finishPlayer = AudioPlayer();
  Timer? timer;
  bool isPlaying = false;
  int currentIndex = 0;
  List<int> remainingDurations = [];
  Color currentSquareColor = Colors.grey;
  int countdownMillis = 0; // Ajouté pour la précision milliseconde
  bool isButtonEnabled = false;
  String utcTime = "00:00:00";
  bool showThankYou = false;
  Timer? thankYouTimer;

  // Nouveaux champs pour la synchronisation de temps
  DateTime? serverTimeOffset;
  bool isSyncingTime = false;
  int syncRetryCount = 0;
  final int maxSyncRetries = 3;
  bool useLocalTime = false;

  // Ajoutez ces constantes pour les notes
  static const double doNote = 1.0;
  static const double solNote = 1.498;

  @override
  void initState() {
    super.initState();

    // Connecter à la synchronisation des secondes
    TimeManager().onTimeUpdate = (timeString) {
      if (mounted) {
        setState(() {
          utcTime = timeString;
          final syncedNow = TimeManager().getNowSynchronized();
          // Activation du bouton à partir de 30s (en ms)
          isButtonEnabled = syncedNow.second >= 30 && !isPlaying;
        });
      }
    };

    // Démarrer la synchronisation si nécessaire
    if (!TimeManager().isSecondSyncActive) {
      TimeManager().startSecondSync();
    }

    // Configuration audio
    setupAudio();
    setupFinishSound();

    if (widget.currentData != null) {
      final List<dynamic> durations = widget.currentData!['durations'] as List;
      remainingDurations = List<int>.from(durations.map((d) => d as int));
    }

    if (widget.isSlideshow) {
      nextPlayer.setReleaseMode(ReleaseMode.loop);
    }

    // Démarrer l'horloge
    startClock();
  }

  void startClock() {
    // Utiliser l'instance partagée du TimeManager
    final timeManager = TimeManager();

    // S'assurer d'avoir une synchronisation à jour
    timeManager.syncTimeWithServer().then((_) {
      // Mise à jour immédiate de l'heure après synchronisation
      final syncedNow = timeManager.getNowSynchronized();
      setState(() {
        utcTime = DateFormat('HH:mm:ss.SSS').format(syncedNow);
        isButtonEnabled = syncedNow.second >= 30 && !isPlaying;
      });

      // Calculer le délai précis pour atteindre la prochaine seconde exacte
      final int millisToNextTick = 10 - (syncedNow.millisecond % 10);

      // Ce timer ponctuel garantit que nous commençons exactement à une nouvelle seconde
      Future.delayed(Duration(milliseconds: millisToNextTick), () {
        // Démarrer le timer principal exactement au début d'une seconde
        timer = Timer.periodic(const Duration(milliseconds: 10), (_) async {
          if (!mounted) return;

          final syncedNow = timeManager.getNowSynchronized();
          setState(() {
            utcTime = DateFormat('HH:mm:ss.SSS').format(syncedNow);
            isButtonEnabled = syncedNow.second >= 30 && !isPlaying;
          });

          // Jouer next.mp3 à chaque seconde avec volume réduit
          if (mounted && isPlaying && countdownMillis == 0) {
            playNextSound(fullVolume: false);
          }

          if (mounted && isPlaying) {
            await updateAnimationPrecise(syncedNow);
          }
        });
      });
    });
  }

  Future<void> setupAudio() async {
    try {
      await countdownPlayer.setSource(AssetSource('sounds/countdown.mp3'));
      await countdownPlayer.setVolume(1.0);

      if (!widget.isSlideshow) {
        // Configuration de next.mp3
        await nextPlayer.setSource(AssetSource('sounds/next.mp3'));
        await nextPlayer.setVolume(1.0);
        await nextPlayer.setReleaseMode(ReleaseMode.release);
      }
    } catch (e) {
      _logger.warning("Erreur configuration audio: $e");
    }
  }

  Future<void> setupFinishSound() async {
    try {
      await finishPlayer.setSource(AssetSource('sounds/fini.mp3'));
      await finishPlayer.setVolume(1.0);
      await finishPlayer.setReleaseMode(ReleaseMode.release);
    } catch (e) {
      _logger.warning("Erreur configuration son de fin: $e");
    }
  }

  Future<void> playDistantMp3() async {
    try {
      if (widget.currentData != null &&
          widget.currentData!['mp3_local'] != null) {
        final dir = await getApplicationDocumentsDirectory();
        final String mp3Path = widget.currentData!['mp3_local'];
        final String fullPath = '${dir.path}/$mp3Path';

        _logger.info("Lecture MP3 depuis: $fullPath");
        await nextPlayer.setReleaseMode(ReleaseMode.loop);
        await nextPlayer.setSource(DeviceFileSource(fullPath));
        await nextPlayer.resume();
      }
    } catch (e) {
      _logger.warning("Erreur lecture MP3: $e");
    }
  }

  void playNextSound({
    bool fullVolume = false,
    bool isBlockTransition = false,
  }) async {
    if (!widget.isSlideshow && mounted) {
      try {
        // Volume augmenté de 20% pour les transitions de bloc
        await nextPlayer.setVolume(
          isBlockTransition ? 1.2 : (fullVolume ? 1.0 : 0.15),
        );

        // Choisir la note en fonction du type de transition
        await nextPlayer.setPlaybackRate(isBlockTransition ? solNote : doNote);

        await nextPlayer.setSource(AssetSource('sounds/next.mp3'));
        await nextPlayer.resume();
      } catch (e) {
        _logger.warning("Erreur lecture next.mp3: $e");
      }
    }
  }

  @override
  void dispose() {
    TimeManager().onTimeUpdate = null;
    // Nettoyer toutes les ressources
    timer?.cancel();
    thankYouTimer?.cancel();
    stopAllAudio();
    countdownPlayer.dispose();
    nextPlayer.dispose();
    finishPlayer.dispose();

    // Ajouter une purge du cache d'images pour éviter les fuites mémoire
    PaintingBinding.instance.imageCache.clear();
    PaintingBinding.instance.imageCache.clearLiveImages();

    super.dispose();
  }

  // Fonction helper pour vérifier les changements de couleur/icône
  bool isGroupChange(List<dynamic> colorIndices, int currentIdx) {
    if (currentIdx <= 0) return false;
    return colorIndices[currentIdx] != colorIndices[currentIdx - 1];
  }

  void stopAllAudio() {
    countdownPlayer.stop();
    nextPlayer.stop();
    finishPlayer.stop(); // Ajouter l'arrêt du son de fin
  }

  Future<void> updateAnimationPrecise(DateTime utcNow) async {
    if (!mounted || !isPlaying) return;

    if (countdownMillis > 0) {
      if (!mounted) return;
      setState(() {
        final now = utcNow;
        countdownMillis =
            (60000 - (now.second * 1000 + now.millisecond)) % 60000;
        if (countdownMillis > 0) {
          countdownPlayer.seek(Duration.zero);
          countdownPlayer.resume();
        }
        if (countdownMillis == 0) {
          startActualAnimation();
        }
      });
      return;
    }

    if (!mounted) return;
    setState(() {
      if (currentIndex < remainingDurations.length &&
          remainingDurations[currentIndex] > 0) {
        remainingDurations[currentIndex]--;
      }

      if (currentIndex < remainingDurations.length &&
          remainingDurations[currentIndex] <= 0) {
        // Si c'est le dernier carré et son décompte vient de finir
        if (currentIndex == remainingDurations.length - 1) {
          // 1. S'assurer que next.mp3 est arrêté avant tout
          nextPlayer.stop();
          isPlaying = false; // Arrêter l'animation

          // 2. Attendre un court instant pour être sûr que next.mp3 est bien arrêté
          Future.delayed(const Duration(milliseconds: 100), () {
            if (!mounted) return;
            setState(() {
              showThankYou = true;
              // 3. Jouer le son de fin une seule fois
              finishPlayer.play(AssetSource('sounds/fini.mp3'));
            });
          });

          // 4. Programmer la fermeture
          thankYouTimer = Timer(const Duration(seconds: 10), () {
            if (mounted) Navigator.pop(context);
          });
        } else {
          final List<dynamic> colorIndices =
              widget.currentData!['colors'] as List;
          final nextIndex = currentIndex + 1;

          if (!widget.isSlideshow) {
            const int columnsPerRow = 10;
            final bool isNewLine = nextIndex % columnsPerRow == 0;
            final bool isNewBlock =
                colorIndices[nextIndex] != colorIndices[currentIndex];

            final bool isBlockContinuation = isNewLine &&
                nextIndex < colorIndices.length &&
                colorIndices[nextIndex] == colorIndices[currentIndex];

            // Jouer next.mp3 avec volume normal au début des blocs
            if (isNewBlock || (isNewLine && !isBlockContinuation)) {
              playNextSound(fullVolume: true, isBlockTransition: true);
            }
          }

          currentIndex++;
          updateCurrentColor();
        }
      }
    });
  }

  void startAnimation() {
    if (!isPlaying) {
      // Utiliser l'heure synchronisée pour tous les utilisateurs
      final DateTime now = TimeManager().getNowSynchronized();
      final int exactMillis = now.second * 1000 + now.millisecond;
      final int millisRemaining = 1000 - now.millisecond;

      setState(() {
        countdownMillis = (60000 - exactMillis) % 60000;

        if (countdownMillis == 0) {
          // Si nous sommes exactement à 0 seconde, démarrer immédiatement
          startActualAnimation();
        } else {
          isPlaying = true;
          // Jouer le son immédiatement au démarrage
          countdownPlayer.seek(Duration.zero);
          countdownPlayer.resume();

          // Planifier le début exact de l'animation avec un timing précis
          Future.delayed(
            Duration(milliseconds: countdownMillis - millisRemaining),
            () {
              if (mounted && isPlaying) {
                setState(() {
                  startActualAnimation();
                });
              }
            },
          );
        }
      });
    }
  }

  void startActualAnimation() {
    if (!mounted) return;
    setState(() {
      currentIndex = 0;
      isPlaying = true;
      if (widget.currentData != null) {
        final List<dynamic> durations =
            widget.currentData!['durations'] as List;
        remainingDurations = List<int>.from(durations.map((d) => d as int));
        updateCurrentColor();
        if (widget.isSlideshow) {
          playDistantMp3();
        }
      }
    });
  }

  void updateCurrentColor() {
    if (widget.currentData == null) return;

    final List<dynamic> colorIndices = widget.currentData!['colors'] as List;
    final List<dynamic> palette = widget.currentData!['palette'] as List;

    if (currentIndex < colorIndices.length) {
      final colorIndex = colorIndices[currentIndex] as int;
      final paletteColor = palette[colorIndex - 1] as String;
      currentSquareColor = Color(
        int.parse(paletteColor.substring(1), radix: 16) + 0xFF000000,
      );
    }
  }

  void playSound(String soundName) {
    try {
      if (soundName == 'click') {
        countdownPlayer.seek(Duration.zero);
        countdownPlayer.resume();
      }
    } catch (e) {
      _logger.warning("Erreur lecture son: $e");
    }
  }

  Widget buildColorDisplay() {
    if (widget.currentData == null) return Container();

    if (showThankYou) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: buildThankYouMessage(MediaQuery.of(context).size.width * 0.8),
        ),
      );
    }

    return Column(
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 16),
          child: Text(
            'couleurs ou icônes',
            style: TextStyle(color: Colors.grey, fontSize: 16),
          ),
        ),
        widget.showPaletteMode
            ? buildColorGrid(
                widget.currentData!['colors'],
                widget.currentData!['palette'],
                widget.currentData!['durations'],
              )
            : buildIconColorGrid(
                widget.currentData!['colors'],
                widget.currentData!['palette'],
                widget.currentData!['icons'],
              ),
        const SizedBox(height: 32),
        LayoutBuilder(
          builder: (context, constraints) {
            return buildBigSquare(constraints.maxWidth / 3);
          },
        ),
        const SizedBox(height: 32),
        Text(
          widget.isSlideshow ? 'mode diaporama' : 'mode animation',
          style: const TextStyle(color: Colors.grey, fontSize: 16),
        ),
        const SizedBox(height: 16),
        buildPlayButton(),
      ],
    );
  }

  Widget buildPlayButton() {
    return ElevatedButton(
      onPressed: (isButtonEnabled && !isPlaying)
          ? () {
              playSound('click');
              startAnimation();
            }
          : null,
      style: ElevatedButton.styleFrom(
        backgroundColor: isButtonEnabled ? Colors.red : Colors.grey[900],
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
        minimumSize: const Size(200, 48),
      ),
      child: Text(
        isPlaying ? 'En cours...' : (isButtonEnabled ? 'Jouez' : 'Patientez'),
        style: TextStyle(
          fontSize: 16,
          color: isButtonEnabled ? Colors.white : Colors.grey,
        ),
      ),
    );
  }

  Widget buildBigSquare(double squareSize) {
    if (isPlaying && countdownMillis > 0) {
      return Container(
        width: squareSize,
        height: squareSize,
        decoration: BoxDecoration(
          color: currentSquareColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[800]!),
        ),
        child: Center(
          child: Text(
            (countdownMillis / 1000).toStringAsFixed(3),
            style: TextStyle(
              color: currentSquareColor.computeLuminance() > 0.5
                  ? Colors.black
                  : Colors.white,
              fontSize: squareSize * 0.2,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      );
    }

    // Pour le mode icônes
    if (!widget.showPaletteMode &&
        widget.currentData != null &&
        currentIndex < widget.currentData!['colors'].length) {
      final List<dynamic> colorIndices = widget.currentData!['colors'] as List;
      final List<dynamic> icons = widget.currentData!['icons'] as List;
      final List<dynamic> palette = widget.currentData!['palette'] as List;

      final colorIndex = colorIndices[currentIndex] as int;
      final iconIndex = icons[colorIndex % icons.length];
      final paletteColor = palette[colorIndex - 1] as String;
      final color = Color(
        int.parse(paletteColor.substring(1), radix: 16) + 0xFF000000,
      );

      return Container(
        width: squareSize,
        height: squareSize,
        decoration: BoxDecoration(
          color: Colors.grey[900], // Fond gris
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.grey[800]!),
        ),
        child: ShaderMask(
          shaderCallback: (bounds) =>
              LinearGradient(colors: [color, color]).createShader(bounds),
          blendMode: BlendMode.srcIn,
          child: Padding(
            padding: EdgeInsets.all(
              squareSize * 0.2,
            ), // Ajout d'un padding pour l'icône
            child: Image.asset(
              'assets/images/$iconIndex.png',
              fit: BoxFit.contain,
            ),
          ),
        ),
      );
    }

    // Pour le mode couleurs (comportement par défaut)
    return Container(
      width: squareSize,
      height: squareSize,
      decoration: BoxDecoration(
        color: currentSquareColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[800]!),
      ),
    );
  }

  Widget buildColorGrid(
    List<dynamic> colorIndices,
    List<dynamic> palette,
    List<dynamic> durations,
  ) {
    const int columnsPerRow = 10;
    const double spacing = 4.0;
    const double underlineSpacing = 4.0;
    const double underlineHeight = 2.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final double availableWidth = constraints.maxWidth;
        final double squareSize =
            ((availableWidth + spacing) / columnsPerRow) - spacing;

        List<List<dynamic>> rows = [];
        for (int i = 0; i < colorIndices.length; i += columnsPerRow) {
          rows.add(colorIndices.skip(i).take(columnsPerRow).toList());
        }

        // Trouver tous les blocs de couleurs
        List<Map<String, dynamic>> blocks = [];
        int startIndex = 0;
        int currentColor = colorIndices[0];

        for (int i = 1; i < colorIndices.length; i++) {
          if (colorIndices[i] != currentColor) {
            blocks.add({
              'start': startIndex,
              'end': i - 1,
              'color': currentColor,
            });
            startIndex = i;
            currentColor = colorIndices[i];
          }
        }
        // Ajouter le dernier bloc
        blocks.add({
          'start': startIndex,
          'end': colorIndices.length - 1,
          'color': currentColor,
        });

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: rows.asMap().entries.map((rowEntry) {
            int rowStartIndex = rowEntry.key * columnsPerRow;
            int rowEndIndex = rowStartIndex + columnsPerRow - 1;

            return Stack(
              children: [
                // Les carrés (existing code)...
                Column(
                  children: [
                    Wrap(
                      spacing: spacing,
                      alignment: WrapAlignment.start,
                      children: List<Widget>.from(
                        rowEntry.value.asMap().entries.map((entry) {
                          final colorIndex = entry.value as int;
                          final globalIndex =
                              (rowEntry.key * columnsPerRow) + entry.key;
                          final duration =
                              globalIndex < remainingDurations.length
                                  ? remainingDurations[globalIndex].toString()
                                  : '';
                          final paletteColor =
                              palette[colorIndex - 1] as String;
                          final color = Color(
                            int.parse(
                                  paletteColor.substring(1),
                                  radix: 16,
                                ) +
                                0xFF000000,
                          );
                          final isExpired =
                              isPlaying && globalIndex < currentIndex;

                          return SizedBox(
                            width: squareSize,
                            height: squareSize,
                            child: AnimatedOpacity(
                              opacity: isExpired ? 0.0 : 1.0,
                              duration: const Duration(milliseconds: 500),
                              child: Container(
                                decoration: BoxDecoration(
                                  color: color,
                                  border: Border.all(
                                    color: Colors.grey[800]!,
                                  ),
                                ),
                                child: Center(
                                  child: Text(
                                    duration,
                                    style: TextStyle(
                                      color: color.computeLuminance() > 0.5
                                          ? Colors.black
                                          : Colors.white,
                                      fontWeight: FontWeight.bold,
                                      fontSize: squareSize * 0.4,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ),
                    SizedBox(height: underlineSpacing),
                  ],
                ),

                // Nouveaux traits de soulignement
                if (!widget.isSlideshow)
                  ...blocks.where((block) {
                    // Vérifier si ce bloc traverse cette ligne
                    return (block['start'] <= rowEndIndex &&
                        block['end'] >= rowStartIndex);
                  }).map((block) {
                    // Calculer les positions de début et de fin pour cette ligne
                    int lineStart = max(block['start'], rowStartIndex);
                    int lineEnd = min(block['end'], rowEndIndex);

                    // Convertir en positions relatives à la ligne
                    int relativeStart = lineStart - rowStartIndex;
                    int relativeLength = lineEnd - lineStart + 1;

                    // Calculer la position et la largeur du trait
                    double startPosition =
                        relativeStart * (squareSize + spacing);
                    double width =
                        relativeLength * (squareSize + spacing) - spacing;

                    return Positioned(
                      left: startPosition,
                      bottom: 0,
                      child: Container(
                        width: width,
                        height: underlineHeight,
                        color: Colors.white.withAlpha(128),
                      ),
                    );
                  }),
              ],
            );
          }).toList(),
        );
      },
    );
  }

  Widget buildIconColorGrid(
    List<dynamic> colorIndices,
    List<dynamic> palette,
    List<dynamic> icons,
  ) {
    const int columnsPerRow = 10;
    const double spacing = 4.0;
    const double underlineSpacing = 4.0;
    const double underlineHeight = 2.0;

    return LayoutBuilder(
      builder: (context, constraints) {
        final double availableWidth = constraints.maxWidth;
        final double squareSize =
            ((availableWidth + spacing) / columnsPerRow) - spacing;

        // Trouver tous les blocs d'icônes (même logique que pour les couleurs)
        List<Map<String, dynamic>> blocks = [];
        int startIndex = 0;
        int currentColor = colorIndices[0];

        for (int i = 1; i < colorIndices.length; i++) {
          if (colorIndices[i] != currentColor) {
            blocks.add({
              'start': startIndex,
              'end': i - 1,
              'color': currentColor,
            });
            startIndex = i;
            currentColor = colorIndices[i];
          }
        }
        // Ajouter le dernier bloc
        blocks.add({
          'start': startIndex,
          'end': colorIndices.length - 1,
          'color': currentColor,
        });

        List<List<dynamic>> rows = [];
        for (int i = 0; i < colorIndices.length; i += columnsPerRow) {
          rows.add(colorIndices.skip(i).take(columnsPerRow).toList());
        }

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: rows.asMap().entries.map((rowEntry) {
            int rowStartIndex = rowEntry.key * columnsPerRow;
            int rowEndIndex = rowStartIndex + columnsPerRow - 1;

            return Stack(
              children: [
                // Les icônes
                Column(
                  children: [
                    Wrap(
                      spacing: spacing,
                      alignment: WrapAlignment.start,
                      children: List<Widget>.from(
                        rowEntry.value.asMap().entries.map((entry) {
                          final colorIndex = entry.value as int;
                          final iconIndex = icons[colorIndex % icons.length];
                          final paletteColor =
                              palette[colorIndex - 1] as String;
                          final color = Color(
                            int.parse(
                                  paletteColor.substring(1),
                                  radix: 16,
                                ) +
                                0xFF000000,
                          );
                          final globalIndex =
                              (rowEntry.key * columnsPerRow) + entry.key;
                          final bool isExpired =
                              isPlaying && globalIndex < currentIndex;
                          final double opacity = isExpired ? 0.0 : 1.0;

                          return SizedBox(
                            width: squareSize,
                            height: squareSize,
                            child: AnimatedOpacity(
                              opacity: opacity,
                              duration: const Duration(milliseconds: 500),
                              child: ShaderMask(
                                shaderCallback: (bounds) => LinearGradient(
                                  colors: [color, color],
                                ).createShader(bounds),
                                blendMode: BlendMode.srcIn,
                                child: Image.asset(
                                  'assets/images/$iconIndex.png',
                                  fit: BoxFit.contain,
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ),
                    SizedBox(height: underlineSpacing),
                  ],
                ),

                // Les traits de soulignement avec la nouvelle logique
                if (!widget.isSlideshow)
                  ...blocks.where((block) {
                    // Vérifier si ce bloc traverse cette ligne
                    return (block['start'] <= rowEndIndex &&
                        block['end'] >= rowStartIndex);
                  }).map((block) {
                    // Calculer les positions de début et de fin pour cette ligne
                    int lineStart = max(block['start'], rowStartIndex);
                    int lineEnd = min(block['end'], rowEndIndex);

                    // Convertir en positions relatives à la ligne
                    int relativeStart = lineStart - rowStartIndex;
                    int relativeLength = lineEnd - lineStart + 1;

                    // Calculer la position et la largeur du trait
                    double startPosition =
                        relativeStart * (squareSize + spacing);
                    double width =
                        relativeLength * (squareSize + spacing) - spacing;

                    return Positioned(
                      left: startPosition,
                      bottom: 0,
                      child: Container(
                        width: width,
                        height: underlineHeight,
                        color: Colors.white.withAlpha(128),
                      ),
                    );
                  }),
              ],
            );
          }).toList(),
        );
      },
    );
  }

  Widget buildIconStrip(
    List<dynamic> colorIndices,
    List<dynamic> palette,
    List<dynamic> icons,
  ) {
    return ListView.builder(
      scrollDirection: Axis.horizontal,
      itemCount: colorIndices.length,
      itemBuilder: (context, index) {
        final colorIndex = colorIndices[index] as int;
        final iconIndex = icons[colorIndex % icons.length];
        final paletteColor = palette[colorIndex - 1] as String;
        final color = Color(
          int.parse(paletteColor.substring(1), radix: 16) + 0xFF000000,
        );

        return Container(
          width: 30,
          margin: const EdgeInsets.symmetric(horizontal: 2),
          child: ShaderMask(
            shaderCallback: (bounds) =>
                LinearGradient(colors: [color, color]).createShader(bounds),
            blendMode: BlendMode.srcIn,
            child: Image.asset(
              'assets/images/$iconIndex.png',
              fit: BoxFit.contain,
            ),
          ),
        );
      },
    );
  }

  Widget buildThankYouMessage(double width) {
    return Container(
      width: width,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey[900],
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[800]!),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Opacity(
            opacity: 0.8,
            child: Image.asset(
              'assets/images/logo.png',
              height: width * 0.3,
              fit: BoxFit.contain,
              color: Colors.white.withAlpha(230),
              colorBlendMode: BlendMode.modulate,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            "${widget.currentData?['groupe'] ?? ''}",
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            "vous remercie pour\nvotre participation à son tifo",
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white70, fontSize: 18),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        title: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Image.asset(
                  'assets/images/logo.png',
                  height: 40,
                  fit: BoxFit.contain,
                ),
                const SizedBox(width: 8),
                const Text(
                  'Tiforama',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  "UTC: $utcTime",
                  style: TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: TimeManager().isSecondSyncActive
                        ? Colors.lightGreen
                        : Colors.white70,
                  ),
                ),
                if (TimeManager().isSyncingTime)
                  const Text(
                    "Synchronisation...",
                    style: TextStyle(fontSize: 9, color: Colors.orange),
                  )
                else if (TimeManager().useLocalTime)
                  const Text(
                    "Heure locale (non synchronisée)",
                    style: TextStyle(fontSize: 9, color: Colors.red),
                  ),
                if (TimeManager().timeOffset != null &&
                    !TimeManager().useLocalTime)
                  Text(
                    "Écart UTC/local: ${TimeManager().timeOffset!.inMilliseconds} ms",
                    style: const TextStyle(
                      fontSize: 9,
                      color: Colors.green,
                    ),
                  ),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          if (TimeManager().isSyncingTime)
            const LinearProgressIndicator(
              backgroundColor: Colors.black,
              valueColor: AlwaysStoppedAnimation<Color>(Colors.orange),
            ),
          Expanded(child: buildColorDisplay()),
        ],
      ),
    );
  }
}

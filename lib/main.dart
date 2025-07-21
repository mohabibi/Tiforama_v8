import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'dart:async';
import 'package:logger/logger.dart' as logger_lib;
import 'package:audioplayers/audioplayers.dart';
import 'package:shared_preferences/shared_preferences.dart';
import './time_manager.dart';
import 'package:logging/logging.dart' as logging;
import 'dart:convert'; // Ajouté pour résoudre les erreurs liées à jsonDecode

final _logger = logging.Logger('MainApp');

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  logging.Logger.root.level = logging.Level.ALL;
  logging.Logger.root.onRecord.listen((record) {
    _logger.info('${record.level.name}: ${record.time}: ${record.message}');
  });

  ErrorWidget.builder = (FlutterErrorDetails details) {
    return Container(
      color: Colors.red,
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.error, color: Colors.yellow, size: 50),
          Padding(
            padding: const EdgeInsets.all(8.0),
            child: Text(
              details.exceptionAsString(),
              style: const TextStyle(color: Colors.yellow),
              textAlign: TextAlign.center,
            ),
          ),
        ],
      ),
    );
  };

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // Initialiser le TimeManager avec la nouvelle méthode
    TimeManager().initialize();

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Tiforama',
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: Colors.black,
        appBarTheme: const AppBarTheme(
          backgroundColor: Colors.black,
          elevation: 0,
          centerTitle: true,
        ),
        textTheme: const TextTheme(
          bodyLarge: TextStyle(fontSize: 16, color: Colors.white),
          bodyMedium: TextStyle(fontSize: 14, color: Colors.white70),
          titleLarge: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.grey[900],
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: BorderSide.none,
          ),
          labelStyle: const TextStyle(
            color: Colors.lightGreen,
            fontSize: 12,
          ),
        ),
      ),
      home: const FirstPage(),
    );
  }
}

class FirstPage extends StatefulWidget {
  const FirstPage({super.key});

  @override
  State<FirstPage> createState() => _FirstPageState();
}

class _FirstPageState extends State<FirstPage> {
  final TextEditingController groupController = TextEditingController();
  final TextEditingController tifoController = TextEditingController();
  final TextEditingController placeController = TextEditingController();
  String utcTime = '00:00:00';
  Timer? timer;
  List<dynamic> groups = [];
  List<dynamic> tifos = [];
  int lastPlace = 0;
  String placeHint = '0';
  final logger_lib.Logger logger = logger_lib.Logger();
  bool isLoading = false;
  final audioPlayer = AudioPlayer();
  late SharedPreferences prefs;
  bool isManualEntry = false;
  bool isManualEntryTifo = false;
  List<Map<String, dynamic>> savedData = [];
  int selectedButtonIndex = -1;
  bool isDataLoaded = false;
  bool isValidationPhase = false;
  bool showMainContent = true;
  String? lastModified;
  Map<String, dynamic>? currentData;
  String? preloadedAudioPath;
  bool isPlaying = false;
  bool isMp3Available = false;
  bool showPaletteMode = true;
  bool isSlideshow = false;
  bool isNetworkAvailable = true;
  bool useLocalTime = false;

  @override
  void initState() {
    super.initState();
    groupController.addListener(_handleFieldChange);
    tifoController.addListener(_handleFieldChange);
    placeController.addListener(_handleFieldChange);
    initializeApp();

    audioPlayer.onPlayerComplete.listen((_) {
      if (mounted) setState(() => isPlaying = false);
    });

    audioPlayer.onPlayerStateChanged.listen((state) {
      if (mounted) setState(() => isPlaying = state == PlayerState.playing);
    });

    // Un seul onTimeUpdate pour éviter les duplications
    TimeManager().startSecondSync();
    TimeManager().onTimeUpdate = (status) {
      if (mounted) {
        setState(() {
          utcTime =
              DateFormat('HH:mm:ss').format(TimeManager().getNowSynchronized());
          useLocalTime = TimeManager().useLocalTime;
        });
      }
    };
  }

  Future<void> initializeApp() async {
    prefs = await SharedPreferences.getInstance();
    startClock();
    await fetchGroups();
    await loadSavedData();
  }

  void _handleFieldChange() {
    if (groupController.text.isNotEmpty ||
        tifoController.text.isNotEmpty ||
        placeController.text.isNotEmpty) {
      setState(() {
        lastModified = 'field';
        selectedButtonIndex = -1;
      });
    } else {
      setState(() {
        lastModified = null;
      });
    }
  }

  Future<void> fetchGroups() async {
    try {
      // Exemple de récupération des groupes (remplacez par votre logique réelle)
      final response = await Future.delayed(
        const Duration(milliseconds: 500),
        () =>
            '{"groups": [{"id": 1, "name": "Groupe A"}, {"id": 2, "name": "Groupe B"}]}',
      );
      final data = jsonDecode(response) as Map<String, dynamic>;
      setState(() {
        groups = data['groups'] as List<dynamic>;
      });
    } catch (e) {
      logger.e('Erreur lors de la récupération des groupes: $e');
    }
  }

  Future<void> loadSavedData() async {
    try {
      final savedDataStrings = prefs.getStringList('saved_data') ?? [];
      setState(() {
        savedData = savedDataStrings
            .map((data) => jsonDecode(data) as Map<String, dynamic>)
            .toList();
      });
    } catch (e) {
      logger.e('Erreur lors du chargement des données sauvegardées: $e');
    }
  }

  void startClock() {
    final syncedNow = TimeManager().getNowSynchronized();
    setState(() {
      utcTime = DateFormat('HH:mm:ss').format(syncedNow);
    });

    final int millisToNextSecond = 1000 - syncedNow.millisecond;

    Future.delayed(Duration(milliseconds: millisToNextSecond), () {
      timer = Timer.periodic(const Duration(seconds: 1), (_) {
        if (!mounted) return;
        final syncedNow = TimeManager().getNowSynchronized();
        setState(() {
          utcTime = DateFormat('HH:mm:ss').format(syncedNow);
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
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
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(
                  'UTC: $utcTime',
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
                    style: TextStyle(
                      fontSize: 9,
                      color: Colors.orange,
                    ),
                  )
                else if (TimeManager().useLocalTime)
                  const Text(
                    "Heure locale (non synchronisée)",
                    style: TextStyle(
                      fontSize: 9,
                      color: Colors.red,
                    ),
                  )
                else if (TimeManager().timeOffset != null &&
                    !TimeManager().isSyncingTime)
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
      body: Stack(
        children: [
          SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                children: [
                  if (showMainContent) ...[
                    const SizedBox(height: 16),
                    // Build group field, tifo dropdown, place input, etc.
                  ] else if (selectedButtonIndex != -1) ...[
                    // Build history text, data display, etc.
                  ],
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
          if (isLoading)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
}

import 'dart:async';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:intl/intl.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:logging/logging.dart' as logging;

// TimeManager avec sauvegarde de l'offset
class TimeManager {
  static final TimeManager _instance = TimeManager._internal();
  factory TimeManager() => _instance;

  final _logger = logging.Logger('TimeManager');

  TimeManager._internal();

  DateTime? serverTimeOffset;
  Duration? timeOffset;
  bool isSyncingTime = false;
  bool useLocalTime = false;
  Function(String)? onTimeUpdate;
  Timer? secondSyncTimer;
  bool isSecondSyncActive = false;

  // Timer pour la synchronisation périodique
  Timer? _periodicSyncTimer;
  static const Duration _periodicSyncInterval = Duration(minutes: 15);
  bool isPeriodicSyncActive = false;

  // Clé pour le stockage SharedPreferences
  static const String _timeOffsetKey = 'time_manager_offset';
  static const String _lastSyncTimeKey = 'time_manager_last_sync';

  // Obtenir l'heure synchronisée
  DateTime getNowSynchronized() {
    if (useLocalTime || timeOffset == null) {
      return DateTime.now().toUtc();
    } else {
      return DateTime.now().toUtc().add(timeOffset!);
    }
  }

  // Sauvegarder l'offset de temps dans SharedPreferences
  Future<void> saveTimeOffset() async {
    if (timeOffset != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_timeOffsetKey, timeOffset!.inMilliseconds);
      await prefs.setInt(
          _lastSyncTimeKey, DateTime.now().millisecondsSinceEpoch);
      _logger
          .info('Offset de temps sauvegardé: ${timeOffset!.inMilliseconds}ms');
    }
  }

  // Charger l'offset de temps depuis SharedPreferences
  Future<void> loadSavedTimeOffset() async {
    final prefs = await SharedPreferences.getInstance();
    final savedOffset = prefs.getInt(_timeOffsetKey);
    final lastSyncTime = prefs.getInt(_lastSyncTimeKey);

    if (savedOffset != null && lastSyncTime != null) {
      // Vérifier si l'offset sauvegardé n'est pas trop ancien (max 24h)
      final syncAge = DateTime.now().millisecondsSinceEpoch - lastSyncTime;
      final maxAge = const Duration(hours: 24).inMilliseconds;

      if (syncAge < maxAge) {
        timeOffset = Duration(milliseconds: savedOffset);
        useLocalTime = false;
        _logger.info(
            'Offset de temps chargé: ${timeOffset!.inMilliseconds}ms (âge: ${syncAge ~/ 60000} minutes)');
        return;
      } else {
        _logger
            .info('Offset de temps trop ancien: ${syncAge ~/ 60000} minutes');
      }
    }

    // Si aucun offset valide n'est trouvé, utiliser l'heure locale
    useLocalTime = true;
    timeOffset = null;
  }

  // Synchroniser l'heure avec le serveur
  Future<void> syncTimeWithServer() async {
    if (isSyncingTime) return;

    isSyncingTime = true;

    try {
      // Faire plusieurs mesures pour plus de précision
      int attempts = 3;
      List<Duration> offsets = [];

      for (int i = 0; i < attempts; i++) {
        final startTime = DateTime.now().toUtc();
        final response = await http
            .get(Uri.parse('https://worldtimeapi.org/api/timezone/Etc/UTC'))
            .timeout(const Duration(seconds: 5));
        final endTime = DateTime.now().toUtc();

        if (response.statusCode == 200) {
          final data = jsonDecode(response.body);
          final serverTime = DateTime.parse(data['utc_datetime']);

          // Calculer l'aller-retour et estimer le délai
          final roundTrip = endTime.difference(startTime);
          final offset = serverTime.difference(startTime
              .add(Duration(milliseconds: roundTrip.inMilliseconds ~/ 2)));

          offsets.add(offset);
        }
      }

      if (offsets.isNotEmpty) {
        // Prendre la médiane pour plus de stabilité
        offsets.sort((a, b) => a.inMicroseconds.compareTo(b.inMicroseconds));
        timeOffset = offsets[offsets.length ~/ 2];
        serverTimeOffset = DateTime.now().toUtc().add(timeOffset!);
        useLocalTime = false;

        // Sauvegarder l'offset pour utilisation hors ligne
        await saveTimeOffset();

        // Démarrer/redémarrer la synchronisation des secondes
        stopSecondSync();
        startSecondSync();
      }
    } catch (e) {
      _logger.warning('Erreur de synchronisation: $e');
      // En cas d'erreur, charger l'offset enregistré précédemment
      await loadSavedTimeOffset();
    } finally {
      isSyncingTime = false;
    }
  }

  // Démarre la synchronisation des secondes
  void startSecondSync() {
    if (isSecondSyncActive) return;

    isSecondSyncActive = true;

    // Obtenir l'heure synchronisée
    final now = getNowSynchronized();

    // Calculer le délai pour atteindre la prochaine seconde
    final millisToNextSecond = 1000 - now.millisecond;

    // Timer ponctuel aligné sur le début de la seconde
    Future.delayed(Duration(milliseconds: millisToNextSecond), () {
      // Notification immédiate
      if (onTimeUpdate != null) {
        onTimeUpdate!(DateFormat('HH:mm:ss').format(getNowSynchronized()));
      }

      // Timer périodique pour chaque seconde suivante
      secondSyncTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        final syncedTime = getNowSynchronized();
        if (onTimeUpdate != null) {
          onTimeUpdate!(DateFormat('HH:mm:ss').format(syncedTime));
        }
      });
    });
  }

  void stopSecondSync() {
    secondSyncTimer?.cancel();
    isSecondSyncActive = false;
  }

  // Démarre la synchronisation périodique
  void startPeriodicSync() {
    if (isPeriodicSyncActive) return;

    _logger.info(
        'Démarrage de la synchronisation périodique (intervalle: ${_periodicSyncInterval.inMinutes} minutes)');
    isPeriodicSyncActive = true;

    // Synchroniser immédiatement
    syncTimeWithServer();

    // Programmer les synchronisations périodiques
    _periodicSyncTimer = Timer.periodic(_periodicSyncInterval, (_) {
      _logger.info('Synchronisation périodique en cours...');
      syncTimeWithServer();
    });
  }

  // Arrêter la synchronisation périodique
  void stopPeriodicSync() {
    _periodicSyncTimer?.cancel();
    _periodicSyncTimer = null;
    isPeriodicSyncActive = false;
    _logger.info('Synchronisation périodique arrêtée');
  }

  // Méthode principale d'initialisation combinant chargement et synchronisation
  Future<void> initialize() async {
    await loadSavedTimeOffset();
    await syncTimeWithServer();
    startSecondSync();
    startPeriodicSync();
  }

  void dispose() {
    stopSecondSync();
    stopPeriodicSync();
  }
}

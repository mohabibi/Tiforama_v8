// Route pour récupérer tous les tifos avec leurs données
app.get('/api/tifos', async (req, res) => {
  try {
    const connection = await pool.getConnection();
    
    // Récupérer tous les tifos avec leurs groupes
    const [tifos] = await connection.execute(`
      SELECT 
        t.id as tifo_id,
        t.name as tifo_name,
        g.name as group_name,
        np.nombre as NP
      FROM tifos t
      JOIN groups g ON t.group_id = g.id
      LEFT JOIN nombre_places np ON t.id = np.tifo_id
      ORDER BY g.name, t.name
    `);

    const result = [];

    for (const tifo of tifos) {
      // Récupérer les durées
      const [durations] = await connection.execute(
        'SELECT duration FROM durations WHERE tifo_id = ? ORDER BY id',
        [tifo.tifo_id]
      );

      // Récupérer les icônes
      const [icons] = await connection.execute(
        'SELECT icon FROM icons WHERE tifo_id = ? ORDER BY id',
        [tifo.tifo_id]
      );

      // Récupérer la palette
      const [palette] = await connection.execute(
        'SELECT color FROM palettes WHERE tifo_id = ? ORDER BY id',
        [tifo.tifo_id]
      );

      // Récupérer l'URL MP3
      const [mp3Urls] = await connection.execute(
        'SELECT url FROM mp3_urls WHERE tifo_id = ? LIMIT 1',
        [tifo.tifo_id]
      );

      // Récupérer les places et reconstruire les collections
      const [places] = await connection.execute(
        'SELECT place_number, color_index FROM places WHERE tifo_id = ? ORDER BY place_number, color_index',
        [tifo.tifo_id]
      );

      const collections = {};
      const colors = [];

      places.forEach(place => {
        if (!collections[place.place_number]) {
          collections[place.place_number] = [];
        }
        collections[place.place_number].push(place.color_index);
        
        // Pour la compatibilité React, on crée aussi un tableau simple colors
        colors[place.place_number - 1] = place.color_index;
      });

      result.push({
        tifo_id: tifo.tifo_id,
        group_name: tifo.group_name,
        tifo_name: tifo.tifo_name,
        durations: durations.map(d => d.duration),
        icons: icons.map(i => i.icon),
        palette: palette.map(p => p.color),
        mp3_url: mp3Urls[0]?.url || '',
        collections,
        colors, // Format simplifié pour React
        NP: tifo.NP
      });
    }

    connection.release();
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération des tifos :', error.message);
    res.status(500).json({ error: `Erreur serveur : ${error.message}` });
  }
});

// Route pour récupérer un tifo spécifique par ID
app.get('/api/tifos/:id', async (req, res) => {
  const tifoId = req.params.id;
  
  try {
    const connection = await pool.getConnection();
    
    // Récupérer le tifo spécifique
    const [tifoResult] = await connection.execute(`
      SELECT 
        t.id as tifo_id,
        t.name as tifo_name,
        g.name as group_name,
        np.nombre as NP
      FROM tifos t
      JOIN groups g ON t.group_id = g.id
      LEFT JOIN nombre_places np ON t.id = np.tifo_id
      WHERE t.id = ?
    `, [tifoId]);

    if (tifoResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Tifo non trouvé' });
    }

    const tifo = tifoResult[0];

    // Récupérer toutes les données du tifo (même logique que ci-dessus)
    const [durations] = await connection.execute(
      'SELECT duration FROM durations WHERE tifo_id = ? ORDER BY id',
      [tifo.tifo_id]
    );

    const [icons] = await connection.execute(
      'SELECT icon FROM icons WHERE tifo_id = ? ORDER BY id',
      [tifo.tifo_id]
    );

    const [palette] = await connection.execute(
      'SELECT color FROM palettes WHERE tifo_id = ? ORDER BY id',
      [tifo.tifo_id]
    );

    const [mp3Urls] = await connection.execute(
      'SELECT url FROM mp3_urls WHERE tifo_id = ? LIMIT 1',
      [tifo.tifo_id]
    );

    const [places] = await connection.execute(
      'SELECT place_number, color_index FROM places WHERE tifo_id = ? ORDER BY place_number, color_index',
      [tifo.tifo_id]
    );

    const collections = {};
    const colors = [];

    places.forEach(place => {
      if (!collections[place.place_number]) {
        collections[place.place_number] = [];
      }
      collections[place.place_number].push(place.color_index);
      colors[place.place_number - 1] = place.color_index;
    });

    const result = {
      tifo_id: tifo.tifo_id,
      group_name: tifo.group_name,
      tifo_name: tifo.tifo_name,
      durations: durations.map(d => d.duration),
      icons: icons.map(i => i.icon),
      palette: palette.map(p => p.color),
      mp3_url: mp3Urls[0]?.url || '',
      collections,
      colors,
      NP: tifo.NP
    };

    connection.release();
    res.json(result);
  } catch (error) {
    console.error('Erreur lors de la récupération du tifo :', error.message);
    res.status(500).json({ error: `Erreur serveur : ${error.message}` });
  }
});

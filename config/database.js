const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./db.sqlite', (err) => {
  if (err) console.error('Error al conectar BD:', err.message);
  else console.log('Conectado a SQLite');
});

const inicializarBD = () => {
  db.serialize(() => {
    // Tabla Usuarios
    db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id_usuario INTEGER PRIMARY KEY,
        nombre_usuario TEXT UNIQUE NOT NULL,
        contraseña TEXT NOT NULL,
        rol TEXT NOT NULL CHECK(rol IN ('encargado', 'administrador'))
      )
    `);

    // Tabla Turnos
    db.run(`
      CREATE TABLE IF NOT EXISTS turno (
        id_turno INTEGER PRIMARY KEY,
        nombre_turno TEXT NOT NULL,
        hora_inicio TEXT NOT NULL,
        hora_fin TEXT NOT NULL
      )
    `);

    // Tabla Espacios
    db.run(`
      CREATE TABLE IF NOT EXISTS espacio (
        id_espacio INTEGER PRIMARY KEY,
        numero INTEGER NOT NULL UNIQUE,
        estado TEXT NOT NULL DEFAULT 'disponible' CHECK(estado IN ('disponible', 'ocupado'))
      )
    `);

    // Tabla Sesiones
    db.run(`
      CREATE TABLE IF NOT EXISTS sesion (
        id_sesion INTEGER PRIMARY KEY,
        id_espacio INTEGER NOT NULL,
        id_turno INTEGER NOT NULL,
        hora_entrada TEXT NOT NULL,
        hora_salida TEXT,
        total_tarifa REAL,
        pago BOOLEAN DEFAULT 0,
        FOREIGN KEY (id_espacio) REFERENCES espacio(id_espacio),
        FOREIGN KEY (id_turno) REFERENCES turno(id_turno)
      )
    `);

    // Insertar datos por defecto
    db.run(`INSERT OR IGNORE INTO turno (id_turno, nombre_turno, hora_inicio, hora_fin) 
            VALUES (1, 'mañana', '06:00', '12:00')`);
    db.run(`INSERT OR IGNORE INTO turno (id_turno, nombre_turno, hora_inicio, hora_fin) 
            VALUES (2, 'tarde', '12:00', '22:00')`);

    for (let i = 1; i <= 10; i++) {
      db.run(`INSERT OR IGNORE INTO espacio (id_espacio, numero) VALUES (?, ?)`, [i, i]);
    }

    db.run(`INSERT OR IGNORE INTO usuarios (id_usuario, nombre_usuario, contraseña, rol) 
            VALUES (1, 'encargado', '1234', 'encargado')`);
    db.run(`INSERT OR IGNORE INTO usuarios (id_usuario, nombre_usuario, contraseña, rol) 
            VALUES (2, 'admin', '1234', 'administrador')`);
  });
};

module.exports = { db, inicializarBD };
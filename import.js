const { MongoClient } = require('mongodb');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration des connexions
const mongoUrl = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'clicom'
};

async function importData() {
  let mongoClient;
  let mysqlConnection;

  try {
    // Connexion à MongoDB
    mongoClient = await MongoClient.connect(mongoUrl);
    const db = mongoClient.db('CLICOM_MONGO');
    
    // Connexion à MySQL
    mysqlConnection = await mysql.createConnection(mysqlConfig);

    // Création des collections
    const clientCollection = db.collection('CLIENT');
    const produitCollection = db.collection('PRODUIT');
    const commandeCollection = db.collection('COMMANDE');

    // Import des clients
    const [clients] = await mysqlConnection.query('SELECT * FROM CLIENT');
    await clientCollection.insertMany(clients.map(client => ({
      NCLI: client.NCLI,
      NOM: client.NOM,
      ADRESSE: client.ADRESSE,
      LOCALITE: client.LOCALITE,
      CAT: client.CAT,
      COMPTE: client.COMPTE
    })));
    console.log(`${clients.length} clients importés`);

    // Import des produits
    const [produits] = await mysqlConnection.query('SELECT * FROM PRODUIT');
    await produitCollection.insertMany(produits.map(produit => ({
      NPRO: produit.NPRO,
      LIBELLE: produit.LIBELLE,
      PRIX: produit.PRIX,
      QSTOCK: produit.QSTOCK
    })));
    console.log(`${produits.length} produits importés`);

    // Import des commandes
    const [commandes] = await mysqlConnection.query('SELECT * FROM COMMANDE');
    const [details] = await mysqlConnection.query('SELECT * FROM DETAIL');

    // Regrouper les détails par commande
    const commandesAvecDetails = commandes.map(commande => {
      const detailsCommande = details.filter(detail => detail.NCOM === commande.NCOM);
      return {
        NCOM: commande.NCOM,
        NCLI: commande.NCLI,
        DATECOM: commande.DATECOM,
        DETAILS: detailsCommande.map(detail => ({
          NPRO: detail.NPRO,
          QCOM: detail.QCOM
        }))
      };
    });

    await commandeCollection.insertMany(commandesAvecDetails);
    console.log(`${commandes.length} commandes importées`);

    console.log('Import terminé avec succès !');

  } catch (error) {
    console.error('Erreur lors de l\'import :', error);
  } finally {
    if (mongoClient) await mongoClient.close();
    if (mysqlConnection) await mysqlConnection.end();
  }
}

importData(); 
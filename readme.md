# Schéma MongoDB pour CLICOM_MONGO

```javascript
// Collection CLIENT
{
  _id: ObjectId,
  NCLI: String,      // Clé primaire
  NOM: String,
  ADRESSE: String,
  LOCALITE: String,
  CAT: String,
  COMPTE: Number
}

// Collection PRODUIT
{
  _id: ObjectId,
  NPRO: String,      // Clé primaire
  LIBELLE: String,
  PRIX: Number,
  QSTOCK: Number
}

// Collection COMMANDE
{
  _id: ObjectId,
  NCOM: String,      // Clé primaire
  NCLI: String,      // Clé étrangère vers CLIENT
  DATECOM: Date,
  DETAILS: [{        // Sous-document pour les détails de la commande
    NPRO: String,    // Clé étrangère vers PRODUIT
    QCOM: Number
  }]
}
```

Notes sur le schéma :

- Chaque collection utilise `_id` comme identifiant unique MongoDB
- La relation entre COMMANDE et CLIENT est maintenue via le champ `NCLI`
- Les détails de commande sont intégrés directement dans le document COMMANDE sous forme de tableau de sous-documents

# Alternative de schéma MongoDB pour CLICOM_MONGO

```javascript
// Collection CLIENT
{
  _id: ObjectId,
  NCLI: String,      // Clé primaire
  NOM: String,
  ADRESSE: String,
  LOCALITE: String,
  CAT: String,
  COMPTE: Number,
  COMMANDES: [{      // Sous-document pour les commandes du client
    NCOM: String,    // Clé primaire de la commande
    DATECOM: Date,
    DETAILS: [{      // Sous-document pour les détails de la commande
      NPRO: String,  // Clé étrangère vers PRODUIT
      QCOM: Number
    }]
  }]
}

// Collection PRODUIT
{
  _id: ObjectId,
  NPRO: String,      // Clé primaire
  LIBELLE: String,
  PRIX: Number,
  QSTOCK: Number,
  COMMANDES: [{      // Sous-document pour les commandes contenant ce produit
    NCOM: String,    // Clé primaire de la commande
    NCLI: String,    // Clé étrangère vers CLIENT
    QCOM: Number
  }]
}
```

Notes sur l'alternative :

- Approche orientée document avec dénormalisation partielle
- Les commandes sont stockées à la fois dans le document CLIENT et PRODUIT
- Avantages :
  - Accès rapide aux commandes d'un client
  - Accès rapide aux commandes contenant un produit spécifique
  - Réduction du nombre de jointures nécessaires
- Inconvénients :
  - Redondance des données
  - Nécessité de maintenir la cohérence entre les collections
  - Documents potentiellement plus volumineux

# Exemples de documents pour le premier schéma

```javascript
// Document CLIENT
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "NCLI": "B112",
  "NOM": "HANSENNE",
  "ADRESSE": "23, r. Dumont",
  "LOCALITE": "Poitiers",
  "CAT": "C1",
  "COMPTE": 1250
}

// Document PRODUIT
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "NPRO": "CS262",
  "LIBELLE": "CHEV. SAPIN 200x6x2",
  "PRIX": 75,
  "QSTOCK": 45
}

// Document COMMANDE
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "NCOM": "30178",
  "NCLI": "K111",
  "DATECOM": ISODate("2015-12-21"),
  "DETAILS": [
    {
      "NPRO": "CS464",
      "QCOM": 25
    }
  ]
}
```

# Exemples de documents pour l'alternative

```javascript
// Document CLIENT avec commandes intégrées
{
  "_id": ObjectId("507f1f77bcf86cd799439014"),
  "NCLI": "K111",
  "NOM": "VANBIST",
  "ADRESSE": "180, r. Florimont",
  "LOCALITE": "Lille",
  "CAT": "B1",
  "COMPTE": 720,
  "COMMANDES": [
    {
      "NCOM": "30178",
      "DATECOM": ISODate("2015-12-21"),
      "DETAILS": [
        {
          "NPRO": "CS464",
          "QCOM": 25
        }
      ]
    }
  ]
}

// Document PRODUIT avec commandes intégrées
{
  "_id": ObjectId("507f1f77bcf86cd799439015"),
  "NPRO": "CS464",
  "LIBELLE": "CHEV. SAPIN 400x6x4",
  "PRIX": 220,
  "QSTOCK": 450,
  "COMMANDES": [
    {
      "NCOM": "30178",
      "NCLI": "K111",
      "QCOM": 25
    },
    {
      "NCOM": "30184",
      "NCLI": "C400",
      "QCOM": 120
    }
  ]
}
```

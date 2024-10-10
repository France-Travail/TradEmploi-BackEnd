import { https } from 'firebase-functions';
import express from 'express';
import gqlServer from './graphql/gqlServer'; // Serveur Apollo
import {format} from 'date-fns';
import {Storage} from "@google-cloud/storage";
import axios from 'axios';


// Créer une nouvelle application Express
const app = express();
const port: number = 8080;
// Importer et appliquer le serveur Apollo pour gérer les requêtes GraphQL
const apolloServer = gqlServer();
https.onRequest(apolloServer);


// Export de type RATES
app.post('/export/rates', async (_req, res) => {

    try {
        const success = await fetchRatesQuery();
        if (success) {
            return res.status(201).json({ status: 'success', message: "Rates export successfully saved." });
        } else {
            return res.status(400).json({ status: 'error', message: "Failed to export rates." });
        }
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

// Export de type KPI
app.post('/export/kpi', async (_req, res) => {

    try {
        const success = await fetchKpiQuery();
        if (success) {
            return res.status(201).json({ status: 'success', message: "Kpi export successfully saved." });
        } else {
            return res.status(400).json({ status: 'error', message: "Failed to export rates." });
        }
    } catch (error) {
        return res.status(500).json({ status: 'error', message: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`⚡️[server]: Reporting server is running on port ${port}`)
})

const fetchRatesQuery = async () => {
    const query = `
    query {
      rates {
        day
        hour
        language
        facilityGrade
        efficientGrade
        offerLinked
        comment
        conversationDuration
        typeEntretien
        nbMessagesAdvisor
        nbMessagesGuest
        user
        agency
        typeSTT
        isTradTonDoc
        nbTranslatedCharacters
      }
    }
  `;

    try {
        // On execute la requête vers le serveur graphQL
        const response = await axios.post('http://localhost:8081/graphql', {
            query: query
        });

        const dataRates = response.data.data.rates;
        const rates: any[] = [];

        // Processus de transformation des données
        dataRates.forEach((element: any) => {
            rates.push({
                Date: element.day,
                Heure: element.hour,
                Langage: element.language,
                conversationDuration: element.conversationDuration,
                'Qualité des traductions': element.facilityGrade,
                'Note de l\'outil': element.efficientGrade,
                'Problème technique': element.offerLinked,
                'Commentaire libre': element.comment,
                'Type entretien': element.typeEntretien,
                'Nombre message conseiller': element.nbMessagesAdvisor,
                'Nombre message Client': element.nbMessagesGuest,
                'identifiant utilisateur': element.user,
                'Identifiant agence': element.agency,
                'type STT': element.typeSTT,
                'Traduction de document': element.isTradTonDoc,
                'Nombre caractères traduits': element.nbTranslatedCharacters
            });
        });

        // Attends la sauvegarde des données dans GCS
        return await saveToGcs(rates, 'rates');

    } catch (error) {
        console.error(error);
        throw new Error(`Impossible de générer le fichier JSON: ${error}`);
    }
};

const fetchKpiQuery = async () => {
    const query = `
    query {
      kpi {
        day
        conversation {
          begin
          end
          duration
          languages
          nbUsers
          translationMode
        }
        device {
          support
          guest {
            equipment
            os {
              name
              version
            }
            browser {
              name
              version
            }
          }
          advisor {
            equipment
            os {
              name
              version
            }
            browser {
              name
              version
            }
          }
        }
        error {
          day
          hours
          descriptions
        }
      }
    }
  `;

    try {
        // On execute la requête vers le serveur graphQL
        const response = await axios.post('http://localhost:8081/graphql', {
            query: query
        });

        const dataKpi = response.data.data.kpi;
        const kpis: any[] = [];

        dataKpi.forEach(function (element: any) {
            kpis.push({
                'Date conversation': element.day,
                'Durée conversation': element.conversation.duration,
                'Heure début conversation': element.conversation.begin,
                'Heure fin conversation': element.conversation.end,
                'Nb utilisateurs': element.conversation.nbUsers,
                'Langue(s)': element.conversation.languages,
                'Mode traduction': element.conversation.translationMode,
                'Support traduction': element.device.support,
                'Conseiller : Device': element.device.advisor.equipment,
                'Client(s) : Device': element.device.guest.equipment,
                'Conseiller : Système d\'exploitation (OS)': element.device.advisor.os.name,
                'Conseiller : Version OS': element.device.advisor.os.version,
                'Conseiller : Navigateur': element.device.advisor.browser.name,
                'Conseiller : Version Navigateur': element.device.advisor.browser.version,
                'Client(s) : Système d\'exploitation (OS)': element.device.guest.os.name,
                'Client(s)  : Version OS': element.device.guest.os.version,
                'Client(s): Navigateur': element.device.guest.browser.name,
                'Client : Version Navigateur': element.device.guest.browser.version,
                'Date erreur': element.error && true ? element.error.day : '',
                'Heure erreur': element.error && true ? element.error.hours : '',
                'Erreur technique': element.error && true ? element.error.descriptions : ''
            });
        });
        return await saveToGcs(kpis, 'kpi');
    } catch (error) {
        console.log(error);
        throw new Error(`Impossible de générer le fichier JSON: ${error}`);
    }
};


// Fonction pour sauvegarder la réponse dans Google Cloud Storage
async function saveToGcs(data : any, exportType : string) {
    try {
        // Initialiser le client GCS
        const storage = new Storage({
            projectId: process.env.GCP_PROJECT || ''
        });

        // Nom du bucket
        const bucketName = process.env.BUCKET_NAME || '';
        const bucket = storage.bucket(bucketName);

        // Créer un nom de fichier avec la date actuelle
        const filename = `${exportType}-report-${format(new Date(), 'yyyy-MM-dd_HH-mm-ss')}.json`;

        // Créer un blob (fichier) dans le bucket et sauvegarder les données JSON
        const file = bucket.file(filename);

        // Ajouter un bloc try-catch pour la sauvegarde de fichier
        try {
            await file.save(JSON.stringify(data), {
                contentType: 'application/json',
            })
            console.log(`Fichier ${filename} sauvegardé dans le bucket ${bucketName}.`);
            return true;
        } catch (saveError) {
            console.error('Erreur lors de la sauvegarde du fichier:', saveError);
            return false;
        }
    } catch (error) {
        console.error('Erreur générale lors de la sauvegarde dans GCS:', error);
        return false;
    }
}





// Exporter le serveur Express pour Firebase Functions
exports.api = https.onRequest(app);

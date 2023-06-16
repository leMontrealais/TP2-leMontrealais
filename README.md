# TP2

Pondération : 35 % \
Énoncé : Cours 14 \
Remise : Cours 18

## Description

Pour ce deuxième travail pratique, vous reprendrez le projet de base de données en ligne effectué lors du premier travail, et lui ajouterez les fonctionnalités suivantes.

## Fonctionnalités et pages requises

### Tri, recherche et filtres

-   Le tri, la recherche et les filtres s'applique désormais un sur l'autre. Ainsi, si une recherche est en cours et que l'utilisateur·rice sélectionne une option de filtrage, cette dernière s'applique sur le résultat de la recherche seulement, non sur l'entièreté du jeu de données.
-   Le titre de la page affiche l'état de la recherche si une recherche est en cours.
-   L'état du tri, de la recherche et du filtrage est stocké dans les paramètres de l'URL, et il est possible de changer cet état en modifiant directement l'URL.

### Récupération des données dynamique

-   Le jeu de données affiché par l'application est récupéré dynamiquement côté client au moment du chargement de la page.
-   L'API d'où proviennent les données est interrogé seulement lors du chargement initial de l'application, et non lors des navigations successives.
-   Au besoin, le jeu de données peut être manipulé lors de sa réception.

### Page « détails » et formulaire d'ajout de commentaires

-   En plus de la page d'accueil effectuée précédemment, l'application permet désormais aux utilisateur·rices de consulter une page « détails » pour chaque valeur du jeu. La page détail affiche toutes les informations disponibles au sujet de la valeur sélectionnée.
-   Un formulaire d'ajout de commentaire est également intégré dans la page détails. Le formulaire demande le **nom**, le **prénom**, le **courriel**, ainsi que le **pays**, la **province** et la **ville** de l'utilisateur·rice.
-   Le formulaire utilise l'API [Country State City](https://countrystatecity.in) pour proposer les choix de réponses. Après avoir sélectionné le pays, l'interface propose un choix de provinces. Après avoir fait le choix de la province, l'interface propose un choix de villes. Si l'utilisateur·rice change un de ses choix, l'interface s'adapte. Si aucun choix n'est retourné par l'API, ou si l'API est hors-service, des champs texte remplacent les boîtes de sélection. La clé API à utiliser est la suivante : `WVRrckJTYjI5bzRyVkllVDVEdzdXUzZiS0Y2bkh3WGNoMGdWd2hwaA==`.
-   Les commentaires sont soumis et sauvegardés dans une base de données clé-valeur (voir annexe), et sont affichés sur la page « détails ».

### Routage

-   La navigation entre les pages se fait selon une architecture « monopage ». Aucun chargement n'est donc nécessaire pour naviguer d'une page à l'autre.
-   L'URL reflète la page sur laquelle les utilisateur·rices se trouvent. Il est également possible d'accéder aux pages en modifiant directement l'URL.
-   Lors de la navigation, l'historique du navigateur est mis à jour. Les utilisateur·rices peuvent naviguer dans celui-ci grâce aux boutons « page précédente » et « suivante ».
-   Le routeur respecte les recommandations d’accessibilité vues en classe : mise à jour du `<title>`, focus sur le `<h1>` après la navigation, et ajout d'un attribut `aria-live` ayant comme valeur `assertive` sur le conteneur du contenu dynamique.

## Critères d'évaluation

### Organisation du code et des fichiers `5`

-   Les fichiers sont bien identifiés et organisés selon leur type.
-   Le code utilise pertinemment les modules Javascript (une classe par module, fichier `main.js`, etc.).

### Respect des consignes `10`

-   Les consignes liées aux fonctionnalités sont respectées.

### Qualité et lisibilité du code `20`

-   Le code est lisible ; il est écrit et commenté de sorte à ce qu'un ou une nouvelle développeuse puisse bien le comprendre.
-   Les classes, constructeurs et méthodes sont documentés avec [JSDoc](https://jsdoc.app/index.html), incluant la description et le type des paramètres.
-   L'indentation du code est respectée et le style du code est constant (astuce : utilisez [Prettier.js](https://prettier.io)).
-   Les algorithmes sont de bonnes qualité.
-   Les possibles erreurs des requêtes `fetch()` sont prises en compte.
-   Le code respecte les principes de la programmation orientée object.
-   Le code est DRY ; il y peu ou pas de répétitions inutiles.
-   Les bonnes balises HTML sont utilisées correctement (astuce : validez votre code avec le [validateur du W3C](https://validator.w3.org/#validate_by_input)).

## Annexe : base de données clé-valeur

### Ajout de commentaires

Pour ajouter un commentaire à la base de données, il suffit de faire une requête POST. Attention, chaque requête **remplace** les anciennes données du serveur par les nouvelles. Il faut donc amender les nouvelles données aux anciennes côté client avant d'en faire l'envoi.

```js
const codereseau = /* e1234567 */;
const data = [
	{
		id: "1",
		lastname: "van Droffelaar",
		firstname: "Josine",
		email: "josine@vandroffelaar.com",
		country: "Canada",
		state: "Québec",
		city: "Montréal",
		comment: "Ceci est un commentaire.",
	},
];

fetch(`https://maisonneuve.maximepigeon.workers.dev/${codereseau}`, {
	method: "POST",
	headers: {
		"Content-Type": "application/json",
	},
	body: JSON.stringify(data),
});
```

### Récupération de commentaires

Pour récupérer les commentaires stockés sur la base de données, il suffit de faire une requête GET :

```js
const codereseau = /* e1234567 */;

fetch(`https://maisonneuve.maximepigeon.workers.dev/${codereseau}`, {
	method: "GET",
	headers: {
		"Content-Type": "application/json",
	},
});
```

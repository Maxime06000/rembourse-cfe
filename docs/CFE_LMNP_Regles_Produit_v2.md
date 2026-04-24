Règles CFE/LMNP — Document de référence produit	v1.0 — Avril 2026

**DÉGRÈVEMENT CFE / LMNP**

Document de référence — Règles juridiques & périmètre produit

Version 1.0  |  Avril 2026

| **Objet du document** Ce document synthétise l'ensemble des règles fiscales applicables au dégrèvement de la Cotisation Foncière des Entreprises (CFE) pour les Loueurs en Meublé Non Professionnels (LMNP). Il constitue la référence juridique pour la conception du simulateur et du générateur de dossiers de réclamation. **Sources : **CGI art. 1459, 1478, 1586 sexies, 1586 quinquies, 1647 B sexies, 1647 D — BOFiP — LF 2024 & 2025 — Jurisprudence CE |
| --- |

# **Sommaire**

1. Contexte général et assujettissement à la CFE

2. Exonérations de plein droit, facultatives et ancienneté

3. Le mécanisme de plafonnement (dégrèvement)

4. Calcul de la valeur ajoutée selon le régime

5. Le verrou de la cotisation minimum

6. Multi-établissements et multi-communes

7. Courte durée vs longue durée : différences applicables

8. Procédure de réclamation et délais

9. Périmètre et règles du produit (MVP)

10. Limites juridiques du service

# **1. Contexte général et assujettissement à la CFE**

## **1.1 Principe général**

La Cotisation Foncière des Entreprises (CFE) est un impôt local institué par la loi de finances 2010 en remplacement de la taxe professionnelle. Elle constitue, avec la CVAE (supprimée progressivement), la Contribution Économique Territoriale (CET).

**Article 1447 du CGI : **toute personne exerçant une activité professionnelle non salariée à titre habituel est redevable de la CFE. La location meublée est fiscalement une activité commerciale, même sous le statut LMNP.

| Un propriétaire LMNP est redevable de la CFE quel que soit son régime fiscal (micro-BIC ou réel) et quel que soit son volume d'activité, dès lors qu'il est immatriculé et qu'il dépasse 5 000 € de recettes annuelles. |
| --- |

## **1.2 Base de calcul de la CFE**

La CFE est assise sur la valeur locative cadastrale du bien loué, calculée selon les mêmes règles que la taxe foncière. Chaque commune vote son propre taux d'imposition, ce qui explique des écarts très importants d'un territoire à l'autre (de 10% à plus de 30%).

La base d'imposition retenue est celle des biens utilisés pour l'activité lors de l'avant-dernière année (N-2). Pour la CFE 2025, ce sont les biens utilisés en 2023.

## **1.3 Cotisation minimum**

Lorsque la valeur locative réelle est inférieure à un seuil fixé par la commune, une cotisation minimum est substituée. Son montant dépend du chiffre d'affaires selon un barème légal (art. 1647 D du CGI).

| **Tranche de CA (recettes)** | **Base min. 2024** | **Base min. 2025** | **Base min. 2026** |
| --- | --- | --- | --- |
| ≤ 10 000 € | 227 € | 243 € | 247 € |
| 10 001 € – 32 600 € | 227 – 539 € | 243 – 579 € | 247 – 589 € |
| 32 601 € – 100 000 € | 539 – 1 078 € | 579 – 1 158 € | 589 – 1 178 € |
| 100 001 € – 250 000 € | 1 078 – 2 695 € | 1 158 – 2 894 € | 1 178 – 2 944 € |
| 250 001 € – 500 000 € | 2 695 – 5 391 € | 2 894 – 5 788 € | 2 944 – 5 889 € |
| > 500 000 € | 5 391 – 7 186 € | 5 788 – 7 717 € | 5 889 – 7 852 € |

| La cotisation minimum figure ligne 189 de l'avis CFE. C'est le plancher absolu que le dégrèvement ne peut jamais franchir. Ce point est critique pour le simulateur. |
| --- |

# **2. Exonérations de plein droit, facultatives et ancienneté**

## **2.1 Exonérations de plein droit (automatiques)**

Les exonérations suivantes s'appliquent sans délibération communale préalable :

- CA ≤ 5 000 € (apprécié sur l'année N-2) : exonération de la cotisation MINIMUM uniquement (art. 1647 D du CGI). Ce n'est pas une exonération totale de CFE — mais en pratique, pour un CA aussi faible, la valeur locative génère une base inférieure à la cotisation minimum, donc aucune CFE n'est due. Ces contribuables ne reçoivent généralement pas d'avis CFE. Hors périmètre du service — aucun dégrèvement possible.

- Première année d'activité : exonération totale (art. 1478 II du CGI). L'exonération vaut pour l'année civile entière, même si l'activité commence en cours d'année.

- Deuxième année d'activité : base d'imposition réduite de 50%.

- Location occasionnelle non répétée d'une partie de l'habitation personnelle (principale ou secondaire) — art. 1459, 1° du CGI.

- Location ou sous-location d'une partie de la résidence principale à un locataire qui en fait sa résidence principale, à un prix raisonnable (plafonds DGFiP : ~200 €/m²/an en IDF, ~147 €/m²/an ailleurs) — art. 1459, 2° du CGI.

| La 3e année est donc la première année de pleine imposition. Un filtre obligatoire dans le simulateur : l'activité doit avoir au moins 3 ans pour être en pleine imposition. |
| --- |

### **Tableau d****'****éligibilité selon l****'****année de début d****'****activité**

| **Début d****'****activité** | **CFE 2024** | **CFE 2025** | **CFE 2026** | **CFE 2027** |
| --- | --- | --- | --- | --- |
| 2022 ou avant | **Pleine** | **Pleine** | **Pleine** | **Pleine** |
| 2023 | **Base −50%** | **Pleine** | **Pleine** | **Pleine** |
| 2024 | **Exonéré** | **Base −50%** | **Pleine** | **Pleine** |
| 2025 | — | **Exonéré** | **Base −50%** | **Pleine** |
| 2026 | — | — | **Exonéré** | **Base −50%** |

**Logique du simulateur : **l'utilisateur saisit l'année de début d'activité. Le simulateur détermine automatiquement le statut pour l'année de CFE choisie. Si Exonéré → arrêt immédiat. Si Base −50% → avertissement que le dégrèvement potentiel est limité.

## **2.2 Exonérations facultatives (sur délibération communale)**

**Art. 1459, 3° du CGI : **les communes et EPCI peuvent voter une exonération pour certaines catégories. En l'absence de délibération contraire, l'exonération s'applique. En présence de délibération contraire, la CFE est due.

| Piège fréquent : un investisseur Airbnb propriétaire d'un appartement dédié à la location courte durée ne peut PAS bénéficier de cette exonération. Le bien doit être sa résidence personnelle. |
| --- |

Autres exonérations facultatives susceptibles de s'appliquer dans des zones spécifiques : ZRR, FRR, QPV, ZFU-TE, BER, ZRD, BUD, ZDP, JEI. Ces cas sont trop spécifiques pour être intégrés dans un MVP généraliste.

# **3. Le mécanisme de plafonnement (dégrèvement)**

## **3.1 Principe**

**Art. 1647 B sexies du CGI : **la CET (CFE + CVAE) de chaque entreprise est plafonnée en fonction de sa valeur ajoutée. Lorsque la CET excède le taux de plafonnement appliqué à la VA, le redevable peut demander un dégrèvement à due concurrence.

Pour les LMNP, la CVAE n'est due que si le CA dépasse 152 500 € HT. En pratique, quasiment aucun LMNP n'est assujetti à la CVAE. Le plafonnement porte donc uniquement sur la CFE.

## **3.2 Taux de plafonnement par année (barème dégressif LF 2024 + LF 2025)**

Le taux évolue chaque année en raison de la suppression progressive de la CVAE. Ce barème est issu du BOFiP BOI-IF-CFE-40-30-20-30 et des lois de finances successives :

| **Année d****'****imposition (CFE)** | **Taux de plafonnement** | **Formulaire de réclamation** |
| --- | --- | --- |
| 2023 | 1,625 % | 1327-CET-SD ou 1327-S-CET-SD |
| **2024** (délai : 31/12/2025) | 1,531 % | 1327-CET-SD ou 1327-S-CET-SD |
| **2025** (délai : 31/12/2026) | 1,438 % | 1327-CET-SD ou 1327-S-CET-SD |
| 2026 | 1,531 % | 1327-CET-SD ou 1327-S-CET-SD |
| 2027 | 1,531 % | 1327-CET-SD (CVAE supprimée) |
| 2028 | 1,438 % | 1327-CET-SD |
| 2029 | 1,344 % | 1327-CET-SD |
| ≥ 2030 | 1,250 % | 1327-CET-SD (plafonnement CFE seul) |

| La LF 2025 a modifié le calendrier prévu par la LF 2024. Le taux 2025 est finalement de 1,438% (conformément au formulaire officiel 1327-CET-SD). Le simulateur doit permettre de choisir l'année concernée. |
| --- |

## **3.3 Formule de calcul du dégrèvement théorique**

| **Dégrèvement théorique = CFE payée − (Taux × VA retenue)** **Dégrèvement réel = min(Dégrèvement théorique ; CFE − Cotisation minimum)** |
| --- |

**Contrainte absolue (art. 1647 B sexies, II du CGI) : **le dégrèvement ne peut en aucun cas ramener la CFE à un montant inférieur à la cotisation minimum. Le plafond bas est la ligne 189 de l'avis d'imposition.

# **4. Calcul de la valeur ajoutée selon le régime**

## **4.1 Régime réel (formulaire 1327-CET-SD)**

**Base légale : **art. 1586 sexies du CGI. La VA est égale à l'excédent hors taxe de la production sur les consommations de biens et services en provenance de tiers.

Sources des données : liasse fiscale, tableaux 2033-B (compte de résultat simplifié) et 2033-E (détermination de la valeur ajoutée). Si le tableau 2033-E est rempli pour un exercice de 12 mois, la VA y est déjà calculée et peut être reportée directement.

| **Produits à retenir (numerator)** | **Charges à déduire (denominator)** |
| --- | --- |
| Production vendue (loyers encaissés HT) | Charges externes (gestion, entretien, assurance, eau, EDF…) |
| Variation positive des stocks | Impôts et taxes (dont CFE elle-même) |
| Production immobilisée (à hauteur des charges déductibles) | Dotations aux amortissements des immobilisations corporelles |
| Subventions d'exploitation reçues | Charges financières (intérêts d'emprunt) |
| Rentrées sur créances amorties liées à l'exploitation | Variation négative des stocks |

| Les amortissements constituent souvent la charge la plus importante pour un LMNP au réel. Ils réduisent significativement la VA, ce qui augmente le dégrèvement potentiel. |
| --- |

**Plafond VA : **si CA ≤ 7,6 M€ et VA brute > 80% du CA → VA retenue = 80% × CA. Ce cas peut se produire si les charges sont très faibles.

## **4.2 Micro-BIC (formulaire 1327-S-CET-SD)**

**Base légale : **art. 1647 B sexies, II-a du CGI (renvoi à l'art. 50-0 du CGI).

| **VA micro-BIC = 80% × (Recettes annuelles brutes − Achats)** |
| --- |

Pour les LMNP en location meublée pure, les achats sont généralement nuls (pas de stock de marchandises). La formule se simplifie donc en pratique :

| **VA micro-BIC (LMNP) = 80% × Recettes annuelles brutes** |
| --- |

| Au micro-BIC, la VA est toujours égale à 80% des recettes, indépendamment des charges réelles. Le plafonnement est donc mécaniquement moins favorable qu'au réel si les charges réelles dépassent 20% du CA. |
| --- |

| ATTENTION — confusion fréquente : l'abattement micro-BIC (50% pour la longue durée, 30% pour la courte durée) sert UNIQUEMENT à calculer le revenu imposable à l'IR. Il n'a AUCUN lien avec le calcul de la VA pour le plafonnement CFE. Le taux de 80% s'applique dans tous les cas, quel que soit le type de location. |
| --- |

**Remarque importante : **les biens en indivision ne peuvent pas relever du micro-BIC. Le Conseil d'État (CE 23 juin 1978, n° 04834) assimile l'indivision à une société de fait. Le formulaire réel (1327-CET-SD) est obligatoire dans ce cas.

## **4.3 Période de référence — point clé pour le simulateur**

**Art. 1586 quinquies du CGI (confirmé BOFiP BOI-IF-CFE-40-30-20-30) : **la VA retenue est celle produite au cours de l'ANNÉE AU TITRE DE LAQUELLE l'imposition est établie — c'est-à-dire l'année même de la CFE réclamée, et non l'année précédente.

| **CFE réclamée** | **VA à utiliser** | **Liasse fiscale source** |
| --- | --- | --- |
| CFE 2024 | VA de l'exercice 2024 | 2033-B clôturée au 31/12/2024 |
| CFE 2025 | VA de l'exercice 2025 | 2033-B clôturée au 31/12/2025 |
| CFE 2026 | VA de l'exercice 2026 | 2033-B clôturée au 31/12/2026 |

| Conséquence directe pour le simulateur : les champs de données financières doivent clairement indiquer 'Données de l'exercice [année de la CFE]'. Exemple : pour réclamer la CFE 2024, saisir les loyers et charges de l'exercice 2024. |
| --- |

Cas particuliers :

- Premier exercice de moins de 12 mois : pas de correction pour ramener à l'année pleine — la VA est calculée sur la durée réelle de l'exercice.

- Plusieurs exercices clos dans l'année : VA cumulée de tous les exercices clos au cours de cette année.

- Pour le micro-BIC : recettes de l'année d'imposition elle-même (même règle).

# **5. Le verrou de la cotisation minimum**

## **5.1 Le piège le plus fréquent**

La cotisation minimum est le plancher absolu de la CFE, fixé par délibération du conseil municipal sur la base du barème légal (art. 1647 D du CGI). Elle est calculée en appliquant le taux d'imposition communal à la base minimum, augmenté des frais de gestion (3% pour les communes et EPCI).

| Point critique pour le produit : si la ligne 9 de l'avis CFE affiche « OUI » (imposition sur base minimum), cela signifie que TOUTE la cotisation est la cotisation minimum. Le plafonnement ne s'applique pas → dégrèvement impossible. |
| --- |

Dans ce cas, le simulateur doit afficher immédiatement : « Votre CFE est intégralement calculée sur la base minimum. Le plafonnement par la valeur ajoutée ne s'applique pas à cette partie. Aucun dégrèvement n'est possible. »

## **5.2 Lecture correcte de l****'****avis CFE**

Les informations critiques à extraire de l'avis d'imposition :

| **Ligne avis** | **Intitulé** | **Usage dans le simulateur** |
| --- | --- | --- |
| Ligne 9 | Imposition sur base minimum | **OUI → bloquer** le dégrèvement |
| Ligne 12 | Base minimum applicable | Seuil théorique (info) |
| Ligne 25 | Total de cotisation foncière des entreprises | Montant à plafonner |
| Ligne 189 | Cotisation minimum CFE | **Plancher absolu** — le dégrèvement ne peut descendre sous ce montant |
| Ligne 194 | Total des cotisations dues | Si plusieurs taxes annexes, reporter ici |

**Exemple chiffré (dossier type) : **CFE payée 922 € | Cotisation minimum ligne 189 = 356 € | Plafonnement théorique = 400 €

- Dégrèvement théorique = 922 − 400 = 522 €

- Dégrèvement réel = min(522 ; 922 − 356) = min(522 ; 566) = 522 €

- CFE résiduelle après dégrèvement = 400 € (respecte le plancher de 356 €)

# **6. Multi-établissements et multi-communes**

## **6.1 Principe de territorialité**

La CFE est établie par commune. Chaque bien loué est un établissement distinct au sens fiscal.

- Plusieurs biens dans la MÊME commune : en principe une seule CFE. En pratique, l'administration facture parfois une CFE par bien — cas contentieux.

- Biens dans des communes DIFFÉRENTES : une CFE distincte par commune, avec un taux d'imposition potentiellement différent pour chacune.

| Un LMNP avec 3 biens dans 3 communes différentes reçoit 3 avis CFE distincts et doit déposer un seul formulaire 1327-CET-SD consolidé qui liste les 3 établissements. |
| --- |

## **6.2 Établissement principal**

**CE 10 juillet 2019, n° 413946 : **l'établissement principal est celui où le redevable réalise son activité à titre principal — généralement le bien avec le chiffre d'affaires le plus élevé. La cotisation minimum est due uniquement au lieu de l'établissement principal.

Pour les LMNP domiciliés fiscalement à leur habitation, la cotisation minimum est établie à l'adresse du domicile fiscal si aucun établissement commercial n'est déclaré.

## **6.3 Formulaire consolidé**

Le cadre B du formulaire 1327-CET-SD liste tous les établissements. Le plafonnement est calculé sur le total des CFE de tous les établissements, comparé à la VA globale de l'entreprise. C'est un calcul unique au niveau entreprise, pas bien par bien.

**Délai de réclamation : **au plus tard le 31 décembre de l'année suivant la mise en recouvrement. Pour la CFE 2024 (avis émis en octobre 2024) : réclamation avant le 31/12/2025.

# **7. Courte durée vs longue durée : différences applicables**

## **7.1 Impact sur le calcul de la VA**

La méthode de calcul de la VA (art. 1586 sexies pour le réel, formule 80% pour le micro-BIC) est strictement identique quel que soit le type de location. Cependant, le profil de charges diffère selon la durée :

| **Composante** | **Longue durée** | **Courte durée (Airbnb, saisonnier)** |
| --- | --- | --- |
| Loyers déclarés | Montant encaissé = montant versé | Montant net versé par la plateforme (commissions déjà déduites) |
| Commissions plateformes | Néant | Non déductibles car non comptabilisées (nettes à la source) |
| Charges de ménage | Faibles (changement locataire) | Élevées et récurrentes (chaque séjour) |
| Consommables | Négligeables | Linge, produits, équipements |
| VA typique / CA | 60–75% | 30–50% (plus de charges externes) |
| Potentiel de dégrèvement | Moyen | **Élevé** (VA plus faible → plafond plus bas) |

| Les plateformes (Airbnb, Booking, Abritel) versent le montant NET après déduction de leur commission. Le propriétaire déclare ce montant net. Il n'y a donc pas de charge de commission à saisir dans le simulateur. |
| --- |

## **7.2 Risque de requalification en para-hôtellerie**

**Art. 261 D, 4° b du CGI (BOFIP mis à jour le 26/03/2025) : **si le propriétaire fournit au moins 3 des 4 services suivants, l'activité bascule de la location meublée à la para-hôtellerie :

- Fourniture du petit déjeuner

- Nettoyage régulier des locaux en cours de séjour

- Fourniture de linge de maison

- Réception de la clientèle (même non personnalisée)

| CONSÉQUENCES : activité assujettie à TVA, affiliation au régime général TNS, règles de VA différentes. Ces propriétaires ne relèvent plus de la location meublée LMNP et sont hors périmètre du service. |
| --- |

Le service doit poser une question de qualification en amont : « Proposez-vous au moins 3 de ces 4 services ? » Si oui → exclusion du parcours.

## **7.3 Conclusion pour le MVP**

La distinction courte/longue durée n'implique aucun parcours différent dans le simulateur. Le formulaire, les champs collectés et le calcul de la VA sont strictement identiques. La seule différence est l'affichage conditionnel de l'alerte para-hôtellerie — qui n'apparaît que si l'utilisateur a indiqué une location de courte durée.

**Précision importante sur les plateformes (Airbnb, Booking, Abritel) : **ces plateformes versent le montant NET après déduction de leur commission. Le propriétaire ne comptabilise que ce montant net comme recette. Il n'y a donc aucune charge de commission à saisir dans le simulateur — elle n'existe pas dans la comptabilité du propriétaire.

| Formulaire unique pour toutes les situations LMNP. Un seul champ supplémentaire en courte durée : la question para-hôtellerie (3/4 services). Pas de données différentes, pas de calcul différent. |
| --- |

# **8. Procédure de réclamation et délais**

## **8.1 Formulaires selon le régime**

| **Régime fiscal** | **Formulaire** | **Disponible sur** |
| --- | --- | --- |
| Bénéfice réel (2031/2033-B) | 1327-CET-SD (CERFA 14108*15) | impots.gouv.fr |
| Micro-BIC / Micro-BNC | 1327-S-CET-SD (CERFA 14109*15) | impots.gouv.fr |

## **8.2 Modalités de dépôt**

La demande constitue une réclamation contentieuse. Elle peut être adressée :

- Via la messagerie sécurisée de l'espace professionnel sur impots.gouv.fr (formulaire « CFE — Je formule une réclamation »)

- Par courrier au Service des Impôts des Entreprises (SIE) dont dépend l'établissement principal

Il n'est pas nécessaire de joindre une copie des avis d'imposition CFE du rôle général. L'administration se réserve le droit de les demander ultérieurement. Pour les rôles supplémentaires, l'obligation de joindre les avis subsiste.

## **8.3 Délais légaux**

| **Situation** | **Délai de réclamation** | **Base légale** |
| --- | --- | --- |
| Cas général (rôle général) | 31 décembre N+1 après mise en recouvrement | LPF art. R*196-2 |
| Rectification par l'administration | 31 décembre N+3 après notification | LPF art. L.174 |
| Flagrance fiscale ou activité occulte | 10 ans | LPF art. L.174 al. 2 |

| La réclamation ne dispense pas de payer la CFE dans les délais. Un sursis de paiement peut être demandé simultanément via la messagerie sécurisée. Des garanties peuvent être exigées si le montant contesté dépasse 4 500 €. |
| --- |

## **8.4 Traitement par l****'****administration**

L'administration dispose de 6 mois à compter du dépôt de la demande pour statuer (art. 1647 B sexies, VI du CGI). En cas d'acceptation, le remboursement est effectué par virement avec intérêts moratoires. En cas de rejet sans paiement préalable, une majoration de 5% est applicable.

# **9. Périmètre et règles du produit (MVP)**

## **9.1 Cas traités par le service**

| **Cas** | **Éligible ?** | **Remarques** |
| --- | --- | --- |
| LMNP régime réel, 1 bien, 1 commune | **Oui** | Parcours standard |
| LMNP régime réel, multi-biens, multi-communes | **Oui** | Formulaire consolidé 1327-CET-SD |
| LMNP micro-BIC, 1 ou plusieurs biens | **Oui** | Formulaire 1327-S-CET-SD |
| Location longue durée et courte durée (hors para-hôtellerie) | **Oui** | Parcours identique, alerte para-hôtellerie pour courte durée |
| Ligne 9 avis = OUI (base minimum imposée) | **Non** | Dégrèvement impossible — message d'explication |
| CA ≤ 5 000 € année N-2 | **Hors scope** | Exonération automatique cotisation min. — pas d'avis CFE en pratique. Si avis reçu : erreur admin, renvoyer SIE. |
| Activité < 3 ans | **Non** | 1ère et 2e années exonérées ou abattues |
| Para-hôtellerie (3/4 services) | **Hors scope** | Activité hors LMNP — renvoyer vers expert-comptable |
| Meublé de tourisme classé dans habitation perso | **Hors scope** | Exonération possible — ne pas traiter en MVP |
| Biens en indivision | **Réel obligatoire** | Micro-BIC non applicable |
| LMNP en SCI à l'IS | **Hors scope** | Régime différent, non couvert |

## **9.2 Données collectées dans le formulaire**

Données minimales requises pour le calcul et la génération du dossier :

### **Identité et références fiscales**

- Nom / prénom

- N° SIRET de l'établissement principal

- Numéro fiscal

- Référence de l'avis CFE (format XX XX XXXXXXX XX)

- Numéro de rôle

- Adresse de l'établissement principal

- Coordonnées (email, téléphone, ville)

### **Données de l****'****avis CFE (par établissement)**

- Montant CFE ligne 25 (total cotisation CFE)

- Montant cotisation minimum ligne 189

- Valeur ligne 9 : OUI ou NON (imposition sur base minimum)

- Année d'imposition concernée

### **Données financières (régime réel)**

- Loyers encaissés (production vendue — 2033-B)

- Charges externes (autres charges externes — 2033-B)

- Impôts et taxes (2033-B)

- Dotations aux amortissements (2033-B)

- Charges financières — intérêts d'emprunt (2033-B)

### **Données financières (micro-BIC)**

- Recettes annuelles brutes déclarées

- Achats éventuels (généralement nuls pour LMNP)

## **9.3 Logique de simulation**

L'algorithme du simulateur suit l'ordre suivant :

- Étape 1 — Filtres bloquants : (a) Année de début d'activité → calcul statut (exonéré / base −50% / pleine). (b) CA N-2 ≤ 5 000 € → hors scope, message admin. (c) Para-hôtellerie (courte durée, 3/4 services) → hors scope. (d) Ligne 9 avis = OUI → arrêt. Si l'un des filtres se déclenche → message explicatif et arrêt du tunnel.

- Étape 2 — Qualification para-hôtellerie : 3 services ou plus fournis ? Si oui → hors scope.

- Étape 3 — Calcul de la VA selon le régime (réel : 1586 sexies ; micro : 80% recettes).

- Étape 4 — Application du plafond 80% CA si VA brute > 80% CA.

- Étape 5 — Calcul du plafonnement : taux de l'année × VA retenue.

- Étape 6 — Calcul du dégrèvement théorique : CFE − plafonnement.

- Étape 7 — Application du plancher : dégrèvement réel = min(dégrèvement théorique ; CFE − cotisation minimum).

- Étape 8 — Affichage résultat : dégrèvement, commission 20%, gain net, ou message « pas de dégrèvement ».

## **9.4 Modèle économique**

Commission de 20% sur le dégrèvement effectivement obtenu, payable après réception du virement de l'administration. Délai moyen de remboursement : 6 mois après dépôt de la réclamation.

Le service génère le mail et le dossier que l'utilisateur envoie lui-même à son SIE. L'utilisateur reste le seul expéditeur de la réclamation.

# **10. Limites juridiques du service**

## **10.1 Monopole du conseil fiscal**

**Ordonnance du 19 septembre 1945, art. 2 (experts-comptables) **et art. 54 de la loi du 31 décembre 1971 (avocats) : la représentation fiscale et le conseil juridique à titre onéreux constituent un monopole. Le service ne peut pas :

- Signer une réclamation au nom du contribuable

- Envoyer la réclamation à sa place

- Garantir un résultat

- Conseiller sur le régime fiscal à adopter

| Le positionnement légal du service est : outil d'aide à la rédaction de documents que l'utilisateur envoie lui-même. Ce modèle est compatible avec le droit en vigueur. Toute mention de « représentation » ou d'« envoi pour le compte » est à proscrire dans les CGV et l'interface. |
| --- |

## **10.2 Mentions légales obligatoires**

- Les calculs fournis sont des estimations basées sur les données déclarées par l'utilisateur.

- Le service n'offre pas de garantie de résultat. L'administration fiscale peut rejeter la réclamation.

- Le service n'est pas un expert-comptable ni un avocat fiscaliste.

- En cas de situation complexe (redressement, contrôle fiscal, activité mixte), un professionnel agréé doit être consulté.

- La commission est due uniquement en cas de remboursement effectif par l'administration.

## **10.3 Données personnelles**

Les données collectées (identité, SIRET, données financières) constituent des données personnelles au sens du RGPD et de la loi informatique et libertés. Un registre des traitements, une politique de confidentialité et une durée de conservation définie sont obligatoires.

| **Sources et références** CGI : art. 1447, 1459, 1478, 1586 sexies, 1586 quinquies, 1647 B sexies, 1647 D BOFiP : BOI-IF-CFE-10-30-30-50, BOI-IF-CFE-20-20-40-10, BOI-IF-CFE-40-30-20-30, BOI-CVAE-BASE-20, BOI-TVA-CHAMP-10-10-50-20 (26/03/2025) Jurisprudence : CE 10 juillet 2019, n° 413946 (établissement principal) — CE 23 juin 1978, n° 04834 (indivision) Lois : LF 2024 (n° 2023-1322 du 29 décembre 2023, art. 79) — LF 2025 (n° 2024-1709 du 29 décembre 2024) — Loi Le Meur n° 2024-1039 du 19 novembre 2024 |
| --- |

	Document confidentiel — usage interne	Page
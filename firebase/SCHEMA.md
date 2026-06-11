# Firebase Schema

## Choix d'architecture

| Besoin | Base | Raison |
|---|---|---|
| Profils utilisateurs | Firestore | Requêtes, persistance, offline cache |
| Catalogue de gages | Firestore | Requêtes par niveau, géré en admin |
| Historique des parties | Firestore | Persistance long terme, requêtes par joueur |
| État live de la partie | Realtime DB | Latence <100 ms, sync automatique |
| Présence / déconnexion | Realtime DB | `onDisconnect` natif |

---

## Firestore

```
users/
  {uid}/
    uid, displayName, email, photoURL, createdAt
    stats: { gamesPlayed, gagesCompleted, gagesRefused, wins, totalDrinksGiven, totalDrinksReceived }

gages/
  {gageId}/
    id, text, emoji, level (soft|epice|chaos), drinksIfRefused, active, createdAt

game_history/
  {gameId}/
    gameId, code, hostId, gageLevel, playerIds[], winnerId
    totalTurns, miniGamesPlayed[], startedAt, finishedAt
    playerSummaries: { [uid]: { score, gagesCompleted, gagesRefused, drinksCount } }
```

## Realtime Database

```
games/
  {gameCode}/
    meta/
      id, code, hostId, status, gageLevel, maxPlayers
      selectedMiniGames[], totalTurns, currentTurnNumber
      createdAt, startedAt, finishedAt

    players/
      {uid}/
        uid, displayName, photoURL, score, lives
        isHost, isReady, online, drinksCount, joinedAt

    turns/
      {turnNumber}/           ← historique complet
        (voir currentTurn)

    currentTurn/              ← nœud actif pendant la partie
      number, miniGameId, status
      gage: { id, text, emoji, level, drinksIfRefused }
      loserId
      results/
        {uid}/  playerId, score, hasWon, data?
      gageValidations/
        {uid}/  true | false
      gageRefused, startedAt, finishedAt

presence/
  {uid}/
    online, currentGameCode, lastSeen
```

## Flux de jeu

```
1. createGame()       → Firestore auth + RT: games/{code}/meta + players/{hostId}
2. joinGame()         → RT: players/{uid}
3. setupPresence()    → RT: presence/{uid}  +  onDisconnect hook
4. updateGameStatus('playing')
5. Boucle de tours:
   a. setCurrentTurn(turn)          → host écrit le tour
   b. submitMiniGameResult(uid)     → chaque joueur écrit son résultat
   c. submitGageValidation(uid)     → chaque joueur vote
   d. resolveGage(refused, loserId) → host finalise, ajoute les gorgées si refus
6. updateGameStatus('finished')
7. saveGameHistory()  → Firestore: game_history/{gameId}
8. incrementUserStats() × N joueurs
```

## Règles de sécurité

- **Firestore** : `firestore.rules` — lecture profil restreinte au propriétaire, gages en lecture seule pour tous les utilisateurs connectés, historique lisible uniquement par les participants.
- **Realtime DB** : `realtime.rules.json` — écriture `meta` et `turns` réservée au host, chaque joueur écrit uniquement son propre nœud `players/{uid}`, validations et résultats limités au joueur lui-même.

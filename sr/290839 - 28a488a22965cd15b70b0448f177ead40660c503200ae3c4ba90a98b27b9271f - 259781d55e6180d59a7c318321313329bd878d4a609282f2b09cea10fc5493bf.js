'use strict';

function _randomStr() {
  return +new Date() + Math.random().toString(36).substr(7);
}

function _requireParams(fields, obj) {
  fields.forEach(f => {
    if (obj[f] === null || typeof obj[f] === 'undefined') {
      throw `${f} is missing.`;
    }
  });
}

function _equals(obj1, obj2, keys) {
  const key = keys[0];
  if (!key) return true;

  if (obj1[key] !== obj2[key]) {
    return false;
  } else {
    return _equals(obj1, obj2, keys.slice(1));
  }
}

function _find(list, predicate) {
  const keys = Object.keys(predicate);
  let res = null;
  for (const i in list) {
    const el = list[i];
    if (_equals(el, predicate, keys)) {
      res = el;
      break;
    }
  }
  return res;
}

// function _filterMap(mapData, filter) {
//   const fields = Object.keys(filter);
//   const map = {};
//   for (let key in mapData) {
//
//   }
// }

function _isEmpty(obj, key) {
  return !obj.hasOwnProperty(key) || (obj[key] === null || typeof obj[key] === 'undefined');
}

// class Object {
//   constructor() {
//     return this;
//   }
//
//   requireParams(fields, obj) {
//     _requireParams(fields, obj || this);
//   }
//
//   toJSON() {
//     return JSON.parse(JSON.stringify(this));
//   }
// }

// {name, bet, userAddr}
class Action {
  constructor({name, bet, userAddr, createdAt, id, status}) {
    this.name = name; // P, R, S

    if (typeof bet === 'string') {
      this.bet = new BigNumber(bet);
    } else {
      this.bet = bet;
    }
    this.userAddr = userAddr;
    this.createdAt = createdAt || +new Date();

    // 1: available to PK, 2: already used for pk, 3: canceled
    this.status = status || 1;

    this.id = id || _randomStr();

    _requireParams(['name', 'bet', 'userAddr'], this);

    return this;
  }
}

// {userAddr, opponentAddr, userAction, opponentAction}
class PlayRound {
  constructor({userAddr, opponentAddr, userActionId, opponentActionId, createdAt, id}) {
    this.userAddr = userAddr;
    this.opponentAddr = opponentAddr;
    this.userActionId = userActionId;
    this.opponentActionId = opponentActionId;
    this.createdAt = createdAt || +new Date();
    this.id = id || _randomStr();

    _requireParams(['userAddr', 'opponentAddr', 'userActionId', 'opponentActionId'], this);

    return this;
  }

  getUserAction(game) {
    return game._getAction(this.userAddr, this.userActionId);
  }

  getOpponentAction(game) {
    return game._getAction(this.opponentAddr, this.opponentActionId);
  }

  // -1 lose; 0: tie; 1: win
  pkResult(game) {
    let res = 0;
    const userAction = this.getUserAction(game);
    const opponentAction = this.getOpponentAction(game);

    if (userAction.name === opponentAction.name) {
      res = 0; // tie
    } else if (userAction.name === 'P') {
      res = opponentAction.name === 'S' ? -1 : 1;
    } else if (userAction.name === 'S') {
      res = opponentAction.name === 'R' ? -1 : 1;
    } else if (userAction.name === 'R') {
      res = opponentAction.name === 'P' ? -1 : 1;
    }
    return res;
  }

  getBet(game) {
    const userAction = this.getUserAction(game);
    const opponentAction = this.getOpponentAction(game);

    let bet = userAction.bet;
    if (bet.gt(opponentAction.bet)) {
      bet = opponentAction.bet;
    }
    return bet;
  }

  getWinnerAddr(game) {
    const status = this.pkResult(game);
    let winner = null;
    if (status === 1) {
      winner = this.userAddr;
    } else if (status === -1) {
      winner = this.opponentAddr;
    }
    return winner;
  }

  getWinnerActionId(game) {
    const status = this.pkResult(game);
    let winner = null;
    if (status === 1) {
      winner = this.userActionId;
    } else if (status === -1) {
      winner = this.opponentActionId;
    }
    return winner;
  }

  transferTokenToWinner(game) {
    const addr = this.getWinnerAddr(game);

    if (addr) {
      const actionId = this.getWinnerActionId(game);
      const action = game._getAction(addr, actionId);

      // value is the winning bet plus the original bet
      const value = this.getBet(game).plus(action.bet);

      const res = Blockchain.transfer(addr, value);
      if (res !== true) {
        throw `${res}: failed to transfer token to the winner`;
      }
      return res;
    }
  }

  returnResidualBet(game) {
    const userAction = this.getUserAction(game);
    const opponentAction = this.getOpponentAction(game);
    const bet = this.getBet(game);

    const action = bet.eq(userAction.bet) ? opponentAction : userAction;
    const value = action.bet.minus(bet);

    if (value.gt(0)) {
      const res = Blockchain.transfer(action.userAddr, value);
      if (res !== true) {
        throw `${res}: failed to return residual bet`;
      }

      return res;
    }
  }

  includeMoreInfo(game) {
    this.status = this.pkResult(game);
    this.bet = this.getBet(game);
    this.winnerAddr = this.getWinnerAddr(game);
  }

  includeUserAndAction(game) {
    this.userAction = game._getAction(this.userAddr, this.userActionId);
    this.opponentAction = game._getAction(this.opponentAddr, this.opponentActionId);
    this.user = game.users.get(this.userAddr);
    this.opponent = game.users.get(this.opponentAddr);
  }
}

// {addr, username, photoUrl}
class User {
  constructor({addr, username, photoUrl, id}) {
    this.addr = addr;
    this.username = username;
    this.photoUrl = photoUrl;
    this.id = id || _randomStr();

    _requireParams(['addr', 'username', 'photoUrl'], this);

    return this;
  }
}

class Game {
  constructor() {
    this.recentPlayRoundsSize = 30;

    /**
     * @key userAddr
     * @value user
     */
    LocalContractStorage.defineMapProperty(this, 'users', {
      parse(str) {
        if (!str) return null;
        const obj = JSON.parse(str);
        return new User(obj);
      }
    });

    /**
     * array of actions {actionId, userId}
     */
    LocalContractStorage.defineProperty(this, 'availableActions');

    /**
     * @key userAddr
     * @value map of actions <key:actionId, value:action>
     */
    LocalContractStorage.defineMapProperty(this, 'userActions', {
      parse(str) {
        if (!str) return null;
        const map = JSON.parse(str);
        for (const key in map) {
          map[key] = new Action(map[key]);
        }
        return map;
      }
    });

    /**
     * @key userAddr
     * @value map of playRounds <key: playRoundId, value: playRound>
     */
    LocalContractStorage.defineMapProperty(this, 'userPlayRounds', {
      parse(str) {
        if (!str) return null;
        const map = JSON.parse(str);
        for (const key in map) {
          map[key] = new PlayRound(map[key]);
        }
        return map;
      }
    });

    /**
     * array of playRounds
     */
    LocalContractStorage.defineProperty(this, 'recentPlayRounds', {
      parse(str) {
        const list = JSON.parse(str);
        return list.map(el => new PlayRound(el));
      }
    });
  }

  init() {
    // Set interval run every 3 days;
    // const loop = 3 * 24 * 3600 * 1000;
    // setInterval(() => {
    //   this._processActions(loop);
    // }, loop);
  }

  accept() {
  }

  getUser() {
    const from = Blockchain.transaction.from;
    return this.users.get(from);
  }

  // Create or update user
  saveUser(data) {
    const addr = Blockchain.transaction.from;
    data.addr = addr;
    const fields = ['username', 'photoUrl'];

    let user = this.users.get(addr);
    if (user) {
      // Update user
      fields.forEach(f => {
        if (!_isEmpty(data, f)) {
          user[f] = data[f];
        }
      });
    } else {
      // Create user
      user = new User(data);
    }
    this.users.set(addr, user);

    return user;
  }

  /**
   * @param {Dict} filter {status<Number>}
   */
  getActions(filter) {
    const from = Blockchain.transaction.from;
    let userActions = this.userActions.get(from);

    let map;
    if (filter) {
      if (filter.hasOwnProperty('status')) {
        map = {};
        for (const id in userActions) {
          if (userActions[id].status === filter.status) {
            map[id] = userActions[id];
          }
        }
        userActions = map;
      }
      if (filter.hasOwnProperty('actionId')) {
        const actionId = filter.actionId;
        map = {
          [actionId]: userActions[actionId]
        };
        userActions = map;
      }
    }

    return userActions;
  }

  // Create the action and deposit to the contract
  createAction(name) {
    const bet = Blockchain.transaction.value;
    const userAddr = Blockchain.transaction.from;

    if (bet.gt(0)) {
      const action = new Action({
        name, bet, userAddr
      });
      const actions = this.userActions.get(userAddr) || {};

      actions[action.id] = action;
      this.userActions.set(userAddr, actions);

      this._updateAvailableActions([{
        id: action.id, userAddr: action.userAddr
      }]);

      return action;
    } else {
      return null;
    }
  }

  getAvailableActions(offset, limit) {
    if (offset === null || typeof offset === 'undefined') {
      offset = 0;
    }
    limit = limit || 30;
    const availableActions = this.availableActions || [];
    const userToActions = {};
    const start = limit * offset;
    const end = start + limit;
    const from = Blockchain.transaction.from;

    if (availableActions.length) {
      availableActions.forEach(action => {
        if (action.userAddr !== from) {
          if (userToActions.hasOwnProperty(action.userAddr)) {
            userToActions[action.userAddr].push(action);
          } else {
            userToActions[action.userAddr] = [action];
          }
        }
      });

      const userAddrs = Object.keys(userToActions).slice(start, end);

      return userAddrs.map(addr => {
        const actionId = userToActions[addr][0].id;
        const action = this._getAction(addr, actionId);
        const user = this.users.get(addr);
        return Object.assign({
          actionId: action.id,
          bet: action.bet
        }, user);
      });
    } else {
      return [];
    }
  }

  cancelAction(actionId) {
    const userAddr = Blockchain.transaction.from;

    return this._cancelAction(userAddr, actionId);
  }

  getPlayRounds(filter) {
    const from = Blockchain.transaction.from;

    let prs = this.userPlayRounds.get(from);

    let map;
    if (filter) {
      if (filter.hasOwnProperty('playRoundId')) {
        const playRoundId = filter.playRoundId;
        map = {
          [playRoundId]: prs[playRoundId]
        };
        prs = map;
      }
    }

    // Add status, bet, WinnerAddr
    for (const id in prs) {
      const playRound = prs[id];
      playRound.includeMoreInfo(this);
      playRound.includeUserAndAction(this);
    }

    return prs;
  }

  getRecentPlayRounds(len) {
    len = len || 10;
    if (!this.recentPlayRounds) {
      return null;
    }

    return this.recentPlayRounds.slice(0, len)
      .map(playRound => {
        playRound.includeMoreInfo(this);
        playRound.includeUserAndAction(this);
        return playRound;
      });
  }

  createPlayRound(opponentAddr, opponentActionId, actionId) {
    const userAddr = Blockchain.transaction.from;

    // check actions exist and status 1
    const userAction = this._getAction(userAddr, actionId);
    if (!userAction || userAction.status !== 1) {
      throw `Action ${actionId} not found for user ${userAddr}`;
    }
    const opponentAction = this._getAction(opponentAddr, opponentActionId);
    if (!opponentAction || opponentAction.status !== 1) {
      throw `Action ${opponentActionId} not found for user ${opponentAddr}`;
    }

    // Update action status
    this._updateAction({id: actionId, status: 2, userAddr});
    this._updateAction({id: opponentActionId, status: 2, userAddr: opponentAddr});

    const playRound = new PlayRound({
      userAddr, userActionId: actionId,
      opponentActionId, opponentAddr
    });

    // Update playRounds for user and opponent
    const playRounds = this.userPlayRounds.get(userAddr) || {};
    playRounds[playRound.id] = playRound;
    this.userPlayRounds.set(userAddr, playRounds);

    const opponetPlayRounds = this.userPlayRounds.get(opponentAddr) || {};
    opponetPlayRounds[playRound.id] = playRound;
    this.userPlayRounds.set(opponentAddr, opponetPlayRounds);

    this._updateRecentPlayRounds(playRound);
    this._updateAvailableActions([
      {
        id: actionId,
        userAddr
      },
      {
        id: opponentActionId,
        userAddr: opponentAddr
      }
    ], true);

    const pkResult = playRound.pkResult(this);

    if (pkResult !== 0) {
      // Auto return the residual amount for the bigger bet
      playRound.returnResidualBet(this);

      // Transfer tokens to winner
      playRound.transferTokenToWinner(this);
    } else {
      // Tie, cancel this two actions
      this._cancelAction(userAddr, actionId);
      this._cancelAction(opponentAddr, opponentActionId);
    }

    return playRound;
  }

  // {id, status}
  // updateAction(data) {
  //   data.userAddr = Blockchain.transaction.from;
  //   return this._updateAction(data);
  // }

  // {id, status, userAddr}
  _updateAction(data) {
    _requireParams(['id'], data);

    const fields = ['status'];
    const userAddr = data.userAddr;
    const actionsData = this.userActions.get(userAddr);
    let action;

    for (const actionId in actionsData) {
      if (actionId === data.id) {
        action = actionsData[actionId];
        fields.forEach(f => {
          if (!_isEmpty(data, f)) {
            action[f] = data[f];
          }
        });
        break;
      }
    }

    if (!action) {
      throw `Action ${data.id} not found for user ${userAddr}`;
    }

    this.userActions.set(userAddr, actionsData);
    return actionsData;
    // return action;
  }

  _updateRecentPlayRounds(playRound) {
    const prs = this.recentPlayRounds || [];

    prs.unshift(playRound);

    while (prs.length > this.recentPlayRoundsSize) {
      prs.pop();
    }

    this.recentPlayRounds = prs;

    return prs;
  }

  _getAction(userAddr, actionId) {
    const actionsData = this.userActions.get(userAddr);

    if (!actionsData) {
      return null;
    }

    return actionsData[actionId];
  }

  _cancelAction(userAddr, actionId) {
    const action = this._getAction(userAddr, actionId);

    if (action && (action.status === 1 || action.status === 2)) {
      const res = Blockchain.transfer(userAddr, action.bet);
      if (res === true) {
        action.status = 3;
        this._updateAction({id: action.id, status: 3, userAddr});
        this._updateAvailableActions([{
          id: action.id, userAddr: action.userAddr
        }], true);
      } else {
        throw `${res}: transfer ${action.bet} to user ${userAddr} failed. `;
      }
    } else {
      throw `action ${actionId} for user ${userAddr} not found. `;
    }

    return action;
  }

  _updateAvailableActions(actions, toRemove) {
    const availableActions = this.availableActions || [];
    let newAvailableActions = [];
    if (toRemove) {
      // Remove actions in this.availableActions
      availableActions.forEach(action => {
        if (!_find(actions, action)) {
          newAvailableActions.push(action);
        }
      });
    } else {
      actions.forEach(action => {
        if (!_find(availableActions, action)) {
          availableActions.push(action);
        }
      });
      newAvailableActions = availableActions;
    }

    this.availableActions = newAvailableActions;
  }
}

module.exports = Game;

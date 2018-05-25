class FakeRand {
    constructor(seed) { this.seed = seed; }
    rand() {
        this.seed = (0x5DEECE66D * this.seed + 0xB) % (1 << 48);
        return this.seed;
    }
}
var Direction;
(function (Direction) {
    Direction[Direction["Up"] = 1] = "Up";
    Direction[Direction["Down"] = 2] = "Down";
    Direction[Direction["Left"] = 3] = "Left";
    Direction[Direction["Right"] = 4] = "Right";
})(Direction || (Direction = {}));
;
class GameSmallMem {
    constructor(seed, size, start_tiles) {
        this.seed = seed;
        this.size = size;
        this.start_tiles = start_tiles;
        this.moves = [];
        this.score = 0;
        this.max_val = 0;
        this.is_end = false;
        this.grid = [];
        for (let i = 0; i < this.size * this.size; i++) {
            this.grid[i] = 0;
        }
        this.fake_rand = new FakeRand(this.seed);
        for (let i = 0; i < this.start_tiles; i++) {
            this.add_random_tile();
        }
    }
    count_available_cells() {
        let count = 0;
        this._for_each((r, c, val) => {
            if (val === 0)
                count++;
            return true;
        });
        return count;
    }
    add_random_tile() {
        let count = this.count_available_cells();
        if (count === 0)
            return;
        let choice = this.fake_rand.rand() % count;
        let value = (this.fake_rand.rand() % 10 < 9) ? 2 : 4;
        let i = 0;
        this._for_each((r, c, val) => {
            if (val === 0) {
                if (i === choice) {
                    this._set_grid_val(r, c, value);
                    return false;
                }
                i++;
            }
            return true;
        });
    }
    _pos_map(i, j, d, cb) {
        if (d === Direction.Up) {
            cb(j, i, this._get_grid_val(j, i));
        }
        else if (d === Direction.Down) {
            cb(this.size - j - 1, i, this._get_grid_val(this.size - j - 1, i));
        }
        else if (d === Direction.Left) {
            cb(i, j, this._get_grid_val(i, j));
        }
        else if (d === Direction.Right) {
            cb(i, this.size - j - 1, this._get_grid_val(i, this.size - j - 1));
        }
    }
    ;
    move(direction) {
        let changed = false;
        for (let i = 0; i < this.size; i++) {
            let last_value = -1;
            let last_index = -1;
            for (let j = 0; j < this.size; j++) {
                this._pos_map(i, j, direction, (row, column, value) => {
                    if (value > 0) {
                        let new_r = -1;
                        let new_c = -1;
                        let new_val = -1;
                        let old_val = -1;
                        let merged = false;
                        if (last_value === value) {
                            this._pos_map(i, last_index, direction, (r, c, val) => {
                                new_r = r;
                                new_c = c;
                                new_val = last_value * 2;
                                old_val = val;
                                merged = true;
                            });
                            changed = true;
                            last_value = -1;
                        }
                        else {
                            last_index++;
                            this._pos_map(i, last_index, direction, (r, c, val) => {
                                new_r = r;
                                new_c = c;
                                new_val = value;
                                old_val = val;
                            });
                            last_value = value;
                        }
                        if (!(row === new_r && column === new_c && old_val === new_val)) {
                            this._set_grid_val(row, column, 0);
                            this._set_grid_val(new_r, new_c, new_val);
                            changed = true;
                            if (merged) {
                                this.score += new_val;
                                this.max_val = Math.max(this.max_val, new_val);
                            }
                        }
                    }
                });
            }
        }
        if (changed) {
            this.add_random_tile();
            this.moves.push(direction);
        }
        return changed;
    }
    apply_moves(moves) {
        let result = true;
        for (let move of moves) {
            if (!this.move(move)) {
                result = false;
            }
        }
        return result;
    }
    _for_each(cb) {
        for (let i = 0; i < this.grid.length; i++) {
            let ret = cb(Math.floor(i / this.size), i % this.size, this.grid[i]);
            if (!ret) {
                break;
            }
        }
    }
    _get_grid_val(r, c) {
        return this.grid[r * this.size + c];
    }
    _set_grid_val(r, c, val) {
        this.grid[r * this.size + c] = val;
    }
}
class Admin {
    _admin_constructor() { LocalContractStorage.defineProperty(this, 'admin'); }
    _admin_init() { this.admin = Blockchain.transaction.from; }
    _is_admin() { return Blockchain.transaction.from === this.admin; }
    _assert_admin() { if (!this._is_admin())
        throw new Error("Admin Only"); }
    get_admin() { return this.admin; }
    set_admin(addr) {
        if (!this._is_admin())
            throw new Error("Admin Only Function.");
        if (!Blockchain.verifyAddress(addr))
            throw new Error("Invalid address.");
        this.admin = addr;
    }
}
class Nickname {
    _nickname_constructor() {
        LocalContractStorage.defineProperty(this, 'new_name_fee', MapBigNumber);
        LocalContractStorage.defineProperty(this, 'rename_fee', MapBigNumber);
        LocalContractStorage.defineMapProperty(this, 'addr_nickname');
        LocalContractStorage.defineMapProperty(this, 'nickname_addr');
    }
    _nickname_init() {
        this.new_name_fee = new BigNumber(0);
        this.rename_fee = new BigNumber(0);
    }
    _valid_name(name) {
        let re = /[\s<>'"`]/gi;
        return !re.test(name);
    }
    get_my_name() {
        return this.addr_nickname.get(Blockchain.transaction.from);
    }
    get_new_name_fee() {
        return this.new_name_fee;
    }
    get_rename_fee() {
        return this.rename_fee;
    }
    get_name_of_addr(addr) {
        return this.addr_nickname.get(addr);
    }
    get_addr_of_name(name) {
        return this.nickname_addr.get(name);
    }
    new_name(name) {
        if (!this._valid_name(name))
            throw new Error("Can't contains special chars.");
        let from = Blockchain.transaction.from;
        let find_addr = this.nickname_addr.get(name);
        if (find_addr === from)
            throw new Error("Please use rename() function to rename.");
        if (find_addr)
            throw new Error("Name already taken.");
        if (new BigNumber(Blockchain.transaction.value).lt(this.new_name_fee))
            throw new Error(`Take new name must transfer larger than ${this.new_name_fee} Wei`);
        this.nickname_addr.put(name, from);
        this.addr_nickname.put(from, name);
    }
    rename(new_name) {
        if (!this._valid_name(new_name))
            throw new Error("Invalid new name.");
        if (!this.addr_nickname.get(Blockchain.transaction.from))
            throw new Error("Please use new_name() function to take a new name.");
        if (new BigNumber(Blockchain.transaction.value).lt(this.rename_fee))
            throw new Error(`Take new name must transfer larger than ${this.rename_fee} Wei`);
        this.nickname_addr.put(new_name, from);
        this.addr_nickname.put(from, new_name);
    }
    admin_give_name(addr, new_name) {
        this._assert_admin();
        if (!this._valid_name(new_name))
            throw new Error("Invalid new name.");
        if (!Blockchain.verifyAddress(addr))
            throw new Error("Invalid addr");
        this.nickname_addr.put(new_name, addr);
        this.addr_nickname.put(addr, new_name);
    }
    admin_set_new_name_fee(fee) {
        this._assert_admin();
        this.new_name_fee = new BigNumber(fee);
    }
    admin_set_rename_fee(fee) {
        this._assert_admin();
        this.rename_fee = new BigNumber(fee);
    }
}
class UserData {
    toJSON() {
        return Object.assign({}, this, {
            donated: this.donated.toString()
        });
    }
    static reviver(key, value) {
        return key === "donated" ? new BigNumber(value) :
            key === "" ? Object.assign(new UserData(), value) :
                value;
    }
}
class DonateData {
    better(other) {
        if (this.amount.gt(other.amount))
            return true;
        else if (this.amount.equals(other.amount) && this.date < other.date)
            return true;
        else
            return false;
    }
    toJSON() {
        return Object.assign({}, this, {
            amount: this.amount.toString(),
            date: this.date.getTime()
        });
    }
    static reviver(key, value) {
        return key === "amount" ? new BigNumber(value) :
            key === "date" ? new Date(value) :
                key === "" ? Object.assign(new DonateData(), value) :
                    value;
    }
}
class GameData {
    better(other) {
        if (this.valid_score > other.valid_score) {
            return true;
        }
        else if (this.valid_score === other.valid_score && this.finish_date < other.finish_date) {
            return true;
        }
        else {
            return false;
        }
    }
    toJSON() {
        return Object.assign({}, this, {
            date: this.date.getTime(),
            expires: this.expires.getTime(),
            finish_date: this.finish_date.getTime(),
        });
    }
    static reviver(key, value) {
        return key === "date" ? new Date(value) :
            key === "expires" ? new Date(value) :
                key === "finish_date" ? new Date(value) :
                    key === "" ? Object.assign(new GameData(), value) :
                        value;
    }
}
class Ranking {
    constructor() {
        this.count = 10;
        this.array = [];
    }
    get_count() { return this.count; }
    set_count(count) { this.count = count; }
    try_add(data) {
        let clone = this.array;
        let on_ranking = false;
        clone.push(data);
        let swapped = false;
        for (let i = clone.length - 1; i > 0; i--) {
            if (clone[i].better(clone[i - 1])) {
                let temp = clone[i];
                clone[i] = clone[i - 1];
                clone[i - 1] = temp;
                swapped = true;
            }
            else {
                break;
            }
        }
        if ((clone.length <= this.count) ||
            (clone.length > this.count && swapped)) {
            on_ranking = true;
        }
        this.array = clone.slice(0, this.count);
        return on_ranking;
    }
    toJSON() {
        return Object.assign({}, this);
    }
    static reviver_gen(reviver) {
        return (key, value) => {
            if (key === "array") {
                let r = [];
                for (let i = 0; i < value.length; i++) {
                    let json = JSON.stringify(value[i]);
                    let item = JSON.parse(json, reviver);
                    r.push(item);
                }
                return r;
            }
            else {
                return value;
            }
        };
    }
}
const MapBigNumber = {
    parse: t => new BigNumber(t),
    stringify: o => o.toString()
};
const MapUserData = {
    parse: t => JSON.parse(t, UserData.reviver),
    stringify: o => JSON.stringify(o)
};
const MapDonateData = {
    parse: t => JSON.parse(t, DonateData.reviver),
    stringify: o => JSON.stringify(o)
};
const MapGameData = {
    parse: t => JSON.parse(t, GameData.reviver),
    stringify: o => JSON.stringify(o)
};
const MapDonateDataRanking = {
    parse: t => Object.assign(new Ranking(), JSON.parse(t, Ranking.reviver_gen(DonateData.reviver))),
    stringify: o => JSON.stringify(o)
};
const MapGameDataRanking = {
    parse: t => Object.assign(new Ranking(), JSON.parse(t, Ranking.reviver_gen(GameData.reviver))),
    stringify: o => JSON.stringify(o)
};
class Contract {
    constructor() {
        this._admin_constructor();
        this._nickname_constructor();
        LocalContractStorage.defineProperties(this, {
            uids_index: null,
            donates_index: null,
            games_index: null,
            game_expire_min: null,
            game_grid_size: null,
            game_start_tiles: null,
        });
        LocalContractStorage.defineProperty(this, "game_fee", MapBigNumber);
        LocalContractStorage.defineMapProperty(this, "uid_addr");
        LocalContractStorage.defineMapProperty(this, "users", MapUserData);
        LocalContractStorage.defineMapProperty(this, "games", MapGameData);
        LocalContractStorage.defineMapProperty(this, "donates", MapDonateData);
        LocalContractStorage.defineProperty(this, "donate_ranking", MapDonateDataRanking);
        LocalContractStorage.defineProperty(this, "game_ranking", MapGameDataRanking);
    }
    init() {
        this._admin_init();
        this._nickname_init();
        this.uids_index = 1;
        this.donates_index = 1;
        this.games_index = 1;
        this.game_expire_min = 60;
        this.game_grid_size = 4;
        this.game_start_tiles = 2;
        this.game_fee = new BigNumber(10000000000000000);
        this.donate_ranking = new Ranking();
        this.game_ranking = new Ranking();
    }
    _new_user_data(addr) {
        let ud = new UserData();
        ud.uid = this.uids_index++;
        ud.addr = addr;
        ud.game_count = 0;
        ud.latest_game_id = 0;
        ud.game_ids = [];
        ud.best_score = 0;
        ud.best_score_game_id = 0;
        ud.best_score = 0;
        ud.cheater = false;
        ud.donated = new BigNumber(0);
        return ud;
    }
    _get_or_new_user(addr) {
        let ud = this.users.get(addr);
        if (ud)
            return ud;
        else
            return this._new_user_data(addr);
    }
    _put_user_data(ud) {
        this.uid_addr.put(ud.uid, ud.addr);
        this.users.put(ud.addr, ud);
    }
    query_user_by_uid(uid) {
        let addr = this.uid_addr.get(uid);
        if (Blockchain.verifyAddress(addr)) {
            return this.users.get(addr);
        }
        return null;
    }
    query_user(addr) {
        return this.users.get(addr);
    }
    query_my_info() {
        return this.users.get(Blockchain.transaction.from);
    }
    list_users(index, limit) {
        if (index < 1)
            throw new Error("index must larger than or equals 1");
        let r = [];
        for (let i = index; i < index + limit && i < this.uids_index; i++) {
            let user = this.users.get(i);
            r.push(user);
        }
        return r;
    }
    get_donates_index() {
        return this.donates_index;
    }
    get_donate_ranking() {
        return this.donate_ranking;
    }
    get_donate_data(id) {
        return this.donates.get(id);
    }
    list_donates(index, limit) {
        if (index < 1)
            throw new Error("Index must greater than or equals with 1");
        let r = [];
        for (let i = index; i < index + limit && i < this.donates_index; i++) {
            r.push(this.donates.get(i));
        }
        return r;
    }
    donate(message) {
        let id = this.donates_index++;
        let from = Blockchain.transaction.from;
        let amount = new BigNumber(Blockchain.transaction.value);
        let date = new Date();
        if (!amount.gt(0))
            throw new Error("Donate amount can not be 0 Wei.");
        let dd = new DonateData();
        dd.id = id;
        dd.addr = from;
        dd.message = message;
        dd.amount = amount;
        dd.date = date;
        this.donates.put(id, dd);
        let clone_dr = this.donate_ranking;
        clone_dr.try_add(dd);
        this.donate_ranking = clone_dr;
        let user_data = this._get_or_new_user(from);
        user_data.donated = user_data.donated.plus(amount);
        this._put_user_data(user_data);
    }
    get_games_index() {
        return this.games_count;
    }
    get_game_data(game_id) {
        return this.games[game_id];
    }
    get_game_ranking() {
        return this.game_ranking;
    }
    get_game_fee() { return this.game_fee; }
    get_game_grid_size() { return this.game_grid_size; }
    get_game_start_tiles() { return this.game_start_tiles; }
    get_game_infoes() {
        return {
            fee: this.game_fee,
            size: this.game_grid_size,
            start: this.game_start_tiles
        };
    }
    list_game_data(index, limit) {
        if (index < 1)
            throw new Error("Index must greater than or equals with 1");
        let r = [];
        for (let i = index; i < index + limit && i < this.games_index; i++) {
            r.push(this.games.get(i));
        }
        return r;
    }
    query_latest_game() {
        let from = Blockchain.transaction.from;
        let user_data = this.users.get(from);
        if (!user_data)
            return null;
        if (user_data.game_count === 0)
            return null;
        let game_data = this.games.get(user_data.latest_game_id);
        if (game_data.finished)
            return null;
        if (new Date() > game_data.expires)
            return null;
        return {
            id: game_data.id,
            date: game_data.date.getTime(),
            expires: game_data.expires.getTime(),
            seed: game_data.seed,
        };
    }
    _new_game_data() {
        let r = new GameData();
        r.id = this.games_index++;
        r.addr = Blockchain.transaction.from;
        r.seed = Math.floor(Math.random() * 65535);
        r.date = new Date();
        r.expires = new Date(r.date.getTime() + 1000 * 60 * this.game_expire_min);
        r.finished = false;
        r.message = "";
        r.finish_date = new Date(0);
        r.score = 0;
        r.max_val = 0;
        r.moves = [];
        r.moves_valid = false;
        r.valid_score = 0;
        return r;
    }
    start_game() {
        if (this.game_fee.gt(new BigNumber(Blockchain.transaction.value))) {
            throw new Error(`Game fee is ${this.game_fee.toString()} Wei. Must transfer more than that.`);
        }
        let from = Blockchain.transaction.from;
        let user = this._get_or_new_user(from);
        let gd = this._new_game_data();
        user.game_count++;
        user.latest_game_id = gd.id;
        user.game_ids.push(gd.id);
        this.games.put(gd.id, gd);
        this._put_user_data(user);
        return gd.id;
    }
    upload_score(game_id, seed, message, score, max_val, moves) {
        let game = this.games.get(game_id);
        if (!game)
            throw new Error("Invalid game id.");
        let from = Blockchain.transaction.from;
        let user = this.users.get(from);
        if (game.addr !== from)
            throw new Error("Not your game.");
        if (game.seed !== seed)
            throw new Error("Not this game, maybe you are cheating.");
        if (new Date() > game.expires)
            throw new Error("Game expired.");
        if (game.finished)
            throw new Error("Game already finished.");
        if (!user)
            throw new Error("User not found, maybe some error in contract code.");
        game.finished = true;
        game.message = message;
        game.finish_date = new Date();
        game.score = score;
        game.max_val = max_val;
        game.moves = moves;
        let game_test = new GameSmallMem(seed, this.game_grid_size, this.game_start_tiles);
        game.moves_valid = game_test.apply_moves(moves);
        game.valid_score = game_test.score;
        if (game.score !== game.valid_score || !game.moves_valid) {
            user.cheater = true;
        }
        else {
            if (user.best_score < game.valid_score) {
                user.best_score = game.valid_score;
                user.best_score_game_id = game.id;
                user.best_score_max_val = game.max_val;
            }
        }
        this._put_user_data(user);
        this.games.put(game.id, game);
        let clone_game_ranking = this.game_ranking;
        clone_game_ranking.try_add(game);
        this.game_ranking = clone_game_ranking;
    }
    admin_set_game_fee(new_fee) {
        this._assert_admin();
        this.game_fee = new BigNumber(new_fee);
    }
    admin_set_game_grid_size(new_size) {
        this._assert_admin();
        if (new_size < 3 || new_size > 20)
            throw new Error("Invalid grid size.");
        this.game_grid_size = new_size;
    }
    admin_set_game_start_tiles(new_start_tiles) {
        this._assert_admin();
        if (new_start_tiles < 0 || new_start_tiles > this.game_grid_size * this.game_grid_size)
            throw new Error("Too big.");
        this.game_start_tiles = new_start_tiles;
    }
    admin_take(value) {
        this._assert_admin();
        let ret = Blockchain.transfer(this.admin, new BigNumber(value));
        if (!ret)
            throw new Error("Transfer failed.");
    }
}
function applyMixins(derivedCtor, baseCtors) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            derivedCtor.prototype[name] = baseCtor.prototype[name];
        });
    });
}
applyMixins(Contract, [Admin, Nickname]);
module.exports = Contract;

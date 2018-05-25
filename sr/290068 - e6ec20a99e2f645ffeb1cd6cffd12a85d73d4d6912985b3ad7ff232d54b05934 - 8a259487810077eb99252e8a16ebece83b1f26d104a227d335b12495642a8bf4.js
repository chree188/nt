"use strict";

class TestContract {
        constructor(){}
 init(){}
	getBlockHeight() {
		return Blockchain.block.height;
	}

}

module.exports = TestContract;
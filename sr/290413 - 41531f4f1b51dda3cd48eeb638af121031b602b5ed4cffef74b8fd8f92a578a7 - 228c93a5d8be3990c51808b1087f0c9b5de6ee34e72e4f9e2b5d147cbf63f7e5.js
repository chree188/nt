class Circular {
    constructor() {
        // define fields stored to state trie.
        LocalContractStorage.defineProperties(this, {
            radius : null,
        });
    }

    // init function.
    init(radius ) {
        this.radius  = radius ;
    }

    set(radius){
        this.radius  = radius ;
    }
    // calc area function.
    calcArea() {
        return this.radius * this.radius * Math.PI;
    }

    // verify function.
    verify(expected) {
        let area = this.calcArea();
        if (expected != area) {
            throw new Error("Error: expected " + expected + ", actual is " + area + ".");
        }
    }
}

module.exports = Circular
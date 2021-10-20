
type Serv = {
    webroot: string,
    port: string
};

class ServHelper {
    serv: Serv;

    constructor(serv: Serv | undefined) {
        this.serv = Object.assign({}, serv);
    }
}
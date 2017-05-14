// 1 minuto tem 60 segundos
const MINUTE = 60;

// 1 hora tem 60 minutos
const HOUR = 60 * MINUTE;

// 1 dia tem 24 horas
const DAY = 24 * HOUR;

// 1 ano tem 365 dias
const YEAR = 365 * DAY;

function getElapsedTime(date) {

    var now = new Date();

    var differenceSeconds = (now.getTime() - date.getTime()) / 1000;

    var anos = differenceSeconds / YEAR;
    var dias = (differenceSeconds % YEAR) / (DAY);
    var horas = ((differenceSeconds % YEAR) % DAY) / HOUR;
    var minutos = (((differenceSeconds % YEAR) % DAY) % HOUR) / MINUTE;
    var segundos = ((((differenceSeconds % YEAR) % DAY) % HOUR) % MINUTE);
    
}

function formatTime(date) {

    var segundos = date.getSeconds();
    var minutos = date.getMinutes();
    var horas = date.getHours();

    horas = (horas.toString().length == 1 ? '0' : '') + horas;
    minutos = (minutos.toString().length == 1 ? '0' : '') + minutos;
    segundos = (segundos.toString().length == 1 ? '0' : '') + segundos;

    return horas + ':' + minutos + ':' + segundos;

}

function formatDate(date) {

    var segundos = date.getSeconds();
    var minutos = date.getMinutes();
    var horas = date.getHours();
    var dia = date.getDate();
    var mes = date.getMonth();
    var ano = date.getFullYear();

    return dia + '/' + mes + '/' + ano + ' ' + horas + ':' + minutos + ':' + segundos;
}
function main() {
    let timetable = document.getElementsByClassName("plan-lekcji")[0];
    let headers = timetable.getElementsByTagName("thead")[0].getElementsByTagName("tr")[0];
    
    let saturdayString = headers.childNodes[headers.childNodes.length-3].lastChild.textContent;
    let saturday = new Date(saturdayString).setHours(0,0,0,0);
    
    let sundayString = headers.childNodes[headers.childNodes.length-2].lastChild.textContent;
    let sunday = new Date(sundayString).setHours(0,0,0,0);

    let today = new Date().setHours(0,0,0,0);
    
    if (today == saturday || today == sunday) {
        zmienTydzien(1); // function from original librus site
    }
}
document.addEventListener("DOMContentLoaded", main);
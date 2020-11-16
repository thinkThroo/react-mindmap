export function getDuration(startTime, endTime) {
    debugger
    // for the 'startDate' and 'endDate', 
    // getState should be used to caculate duration
    // let {
    //     startTime,
    //     endTime
    // } = activeProject
    // Find the distance between now and the count down date
    if (endTime == null) {
        return {
            val: "Not yet finished"
        }
    } else {
        debugger
        var distance = (new Date(endTime).getTime() - new Date(startTime).getTime());

        // if (this.timer) {
        //     clearInterval(this.timer);
        // }

        // if (distance <= 0) {
        //     clearInterval(this.timer);
        // } else {
        // Update the count down every 1 second
        // this.timer = setInterval(() => {
        //     debugger;
        // Time calculations for days, hours, minutes and seconds
        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        // Output the result in an element with id="demo"
        // console.log(days + "d " + hours + "h " + minutes + "m " + seconds + "s ");
        // If the count down is over, write some text 
        // if (distance < 0) {
        //     clearInterval(this.timer);
        // }
        let obj = {
            val: days + "d " + hours + "h " + minutes + "m " + seconds + "s "
        }

        // distance = distance - 1000;
        // }, 1000);
        // }

        return obj;
    }
}
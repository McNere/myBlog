var comment = document.querySelector("#commentInput");
var count = document.querySelector("#count");

if (comment) {
    comment.onkeyup = function() {
        count.innerHTML = this.value.length;
    }
}
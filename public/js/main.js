$(document).ready(function() {
    $('.delete-article').on('click', function(e) {
        $target = $(e.target);
        const id = $target.attr('data-id');
        console.log("i'm in delete!", id);

        $.ajax({
            type : 'DELETE',
            url : '/article/' + id,
            success : function(response) {
                alert('deleting article');
                window.location.href='/';
            },
            error : function(err) {
                console.log('delete error :', err);
            }
        });
    });
});
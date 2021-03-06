// triggered when search/load button is clicked
// performs task based on the user query and login status
function processSearch() {
    var query = $('#query').val();
    if( query.search("vimeo.com/") !== -1 ) {
        window.location = 'index.php?vimeoUrl=' + query;
    } else if(( query.search("youtu.be/") !== -1 ) || ( query.search("youtube.com/watch")  !== -1 )) {
        window.location = 'index.php?ytUrl=' + query;
    } else if(document.URL.search('index') === -1 && query !== '') {
        window.location = 'index.php?vq=' + query;
    } else {
        // as of now search only works when user is logged in
        yTSearch(0);
    }
}

// Get video data from youtube and display
function yTSearch(pageNum) {
    var query = $('#query').val();
    var url = "https://gdata.youtube.com/feeds/api/videos";
    var startIndex = 25 * pageNum;
    var data = 'q=' + query + '&key=' + YOUTUBE_DEVELOPER_KEY;
    var htmlResult = '';
    var isSearchSucessful = false;
    var videoIds = [];
    data += '&part=snippet&order=relevance&maxResults=25&type=video&videoSyndicated=true&videoEmbeddable=true&videoDimension=2d';

    if(startIndex !== 0)
        data += '&start-index=' + startIndex;

    $.get(url, data, function(response){
        //  console.log(response);
        if(query === '')
            htmlResult = '<h1 align="center">Most popular videos</h1>';
        htmlResult += '<table class="videoResults" align="center" style="cursor:pointer;">';

        // manipulate each video entry data
        $(response).find('entry').each(function(){
            isSearchSucessful = true;
            // console.log($(this).find("title")[0]);
            var videoId = $(this).find("id").text().split('/').slice(-1);
            var title = $($(this).find("title")[0]).text();
            var description = $(this).find("content").text();
            
            // copy the video id for displaying tag 
            videoIds.push(videoId);
            
            if(title.length > 100) {
                title = title.substr(0, 75) + '...';
            }
            if(description.length > 115) {
                description = description.substr(0, 115) + '...';
            }

            htmlResult += '<tr onclick="document.location = \'index.php?ytUrl=http://www.youtube.com/watch?v=' + videoId + '\'">';
            htmlResult += '<td style="width:16px;"><img id="tag-icon-' + videoId + '" src="images/tag.png" style="width:16px;height:16px;float:right;display:none;" title="This video hasbeen tagged"></td>';
            htmlResult += '<td><img src="http://i.ytimg.com/vi/'+ videoId +'/0.jpg" alt="' + title + '"/></td>';
            htmlResult += '<td id="info"><span>'+ '<span id="title">' + title + '</span><br/>';
            htmlResult += '<span id="description">' + description + '</span></span></td></tr>';
        });
        htmlResult += '</table>';
        
        if(!isSearchSucessful) {
            htmlResult += '<div class="form">';
            htmlResult += '<p align="center"><label>No video results found for query "' + query + '"</label></p>';
            htmlResult += '<p align="center"><label>Hint: Type few words for better results</label></p>';
            htmlResult += '</div>';
        }else {
            
            var postData = JSON.stringify(videoIds);
            postData = {json:postData};
            $.post('isVideoTagged.php', postData, function(myResponse){
                videoIds = $.parseJSON(myResponse);
                for (var i = 0; i < videoIds.length; i++){
                    // display tag icon for videos which are tagged in VTP
                    $('#tag-icon-' + videoIds[i] ).css('display', 'block')
                }
            });
            
            // page navigation
            htmlResult +=  '<div class="pageNav">';
            htmlResult +=  '<img src="images/Button-Back-icon.png"';
            if(pageNum !== 0)
                htmlResult +=  ' onClick="yTSearch(' + (pageNum - 1) + ')"  title="' + (pageNum) + '"';
            htmlResult +=  ' alt="Previous Page"/>';
            htmlResult +=  '<p>&nbsp;&nbsp;'+ (pageNum + 1) + '&nbsp;&nbsp;</p>';
            htmlResult +=  '<img src="images/Button-Next-icon.png" onClick="yTSearch(' + (pageNum + 1) + ')" alt="Next Page" title="' + (pageNum + 2) + '" />';
            htmlResult +=  '</div>';
        }
        $('#container').html(htmlResult);
        $('#container').css('display', 'block');
    });
}

$(document).ready(function(){
    // event listner for enter key press on search bar
    $('#query').keypress(function(event){
        if(event.which == 13){
            processSearch();
        }
    });
});
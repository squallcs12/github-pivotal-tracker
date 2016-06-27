(function () {
  var port = chrome.runtime.connect();

  function generate_pr_description() {
    var commits = $(".commit");
    var stories = [];
    commits.each(function () {
      var commit = $(this).text();
      var matchs = commit.match(/\[#.+\]/);
      
      for (var i = 0; i < matchs.length; i++) {
        var match = matchs[i];
        var story_id = match.substring(2, match.length - 1);
        stories.push(story_id);
      }
    
    });

    var titles = {};
    var ajaxs = [];
    for (var i = 0; i < stories.length; i++) {
      var story_id = stories[i];
      var ajax = $.get("https://www.pivotaltracker.com/services/v5/stories/" + story_id, function (data) {
        titles[data.id] = data;
      });
      ajaxs.push(ajax);
    }

    $.when.apply($, ajaxs).always(function () {
      var descriptions = [];
      for (var id in titles) {
        var data = titles[id];
        descriptions.push("[#" + id + "] [" + data.name + "](" + data.url + ")");
      }

      var description = descriptions.join("\n");
      $("#pull_request_body").val(description);
    });
  }
  var createButton = $(".compare-pr-placeholder .js-details-target");
  createButton.on('click', generate_pr_description);
  if (!createButton.is(':visible')) {
    generate_pr_description();
  }

  window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.type && (event.data.type == "FROM_PAGE")) {

    }
  }, false);
})();
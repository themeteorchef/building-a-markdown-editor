Template.editor.onRendered( function() {
  // Initialize our CodeMirror editor (where we type out Markdown).
  var editor = CodeMirror.fromTextArea( this.find( "#editor" ), {
    lineNumbers: false,
    fixedGutter: false,
    mode: "markdown",
    theme: "night",
    lineWrapping: true
  });
});

Template.editor.helpers({
  document: function(){
    var getDocument = Documents.findOne();

    if ( getDocument ) {
      return getDocument;
    }
  }
});

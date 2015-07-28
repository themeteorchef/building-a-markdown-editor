Meteor.methods({
  insertDocument: function( title ){
    // Check the argument. Assuming a String type here.
    check( title, String );

    var doc = {
      title: title,
      owner: Meteor.userId(),
      // Note: here we insert a blank space to account for our editor's default state.
      // Without this, our editor would read this field as "undefined" and we'd run
      // into some sticky errors on the client when we first start a document.
      markdown: " "
    };

    try {
      var documentId = Documents.insert( doc );
      console.log( documentId + " " + doc );
      return documentId;
    } catch( exception ) {
      return exception;
    }
  }
});

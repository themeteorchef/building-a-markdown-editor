Meteor.methods({
  insertDocument: function( title ){
    // Check the argument. Assuming a String type here.
    check( title, String );

    var doc = {
      title: title,
      owner: Meteor.userId(),
      markdown: ""
    };

    try {
      var documentId = Documents.insert( doc );
      return documentId;
    } catch( exception ) {
      return exception;
    }
  }
});

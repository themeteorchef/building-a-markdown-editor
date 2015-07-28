/*
* Methods: Update - Example
* Example of a method used for updating a document in the database.
*/

Meteor.methods({
  updateDocument: function( changes ){
    // Check the argument. Assuming an Object type here.
    check( changes, {
      _id: String,
      markdown: Match.Optional( String ),
      title: Match.Optional( String )
    });

    var doc = changes._id;
    delete changes._id;

    // Perform the update.
    try {
      var documentId = Documents.update( doc, {
        $set: changes
      });
      return documentId;
    } catch(exception) {
      // If an error occurs, return it to the client.
      return exception;
    }
  }
});

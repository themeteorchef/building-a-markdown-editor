Template.documents.helpers({
  documents: function(){
    var getDocuments = Documents.find( {}, { fields: { "title": 1 } } );

    if ( getDocuments ) {
      return getDocuments;
    }
  }
});

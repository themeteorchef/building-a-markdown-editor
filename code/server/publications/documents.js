Meteor.publish( 'documents', function(){
  var user = this.userId;
  var data = Documents.find( { "owner": user }, { fields: { "owner": 1, "title": 1 } } );

  if ( data ) {
    return data;
  }

  return this.ready();
});

Meteor.publish( 'document', function( documentId ) {
  check( documentId, String );

  var user = this.userId;
  var data = Documents.find( { "owner": user, "_id": documentId } );

  if ( data ) {
    return data;
  }

  return this.ready();
});

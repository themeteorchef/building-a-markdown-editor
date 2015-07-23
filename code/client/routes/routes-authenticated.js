/*
* Routes: Authenticated
* Routes that are only visible to authenticated users.
*/

Router.route('index', {
  path: '/'
});

Router.route( 'documents', {
  path: '/documents',
  template: 'documents',
  subscriptions: function(){
    return Meteor.subscribe( 'documents' );
  },
  onBeforeAction: function(){
    Session.set( "currentRoute", "documents" );
    Session.set( "currentDocument", null );
    this.next();
  }
});

Router.route( 'editor', {
  name: "editor",
  path: '/documents/:_id',
  template: 'editor',
  subscriptions: function(){
    return Meteor.subscribe( 'document', this.params._id );
  },
  onBeforeAction: function(){
    Session.set( "currentRoute", "editor" );
    Session.set( "currentDocument", this.params._id );
    this.next();
  }
});

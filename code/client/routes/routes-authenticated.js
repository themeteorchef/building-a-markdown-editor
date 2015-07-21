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
    this.next();
  }
});

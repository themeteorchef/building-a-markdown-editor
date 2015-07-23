### Getting Started

<p class="block-header">Terminal</p>

```bash
meteor add perak:codemirror
```
To give us a fancy text editor with syntax highlighting, we'll make use of the [CodeMirror]() library which we can get access to from the [`perak:codemirror`](https://atmospherejs.com/perak/codemirror) package.


<p class="block-header">Terminal</p>

```bash
meteor add themeteorchef:commonmark
```
We'll be using the [commonmark.js](https://github.com/jgm/commonmark.js) library to parse Markdown on the server. To get access to this (and a helper function for parsing Markdown), we'll install `themeteorchef:commonmark`.

<p class="block-header">Terminal</p>

```bash
meteor add deanius:promise
```
Because we'll be chaining a few method calls, we'll use the [`deanius:promise`](https://atmospherejs.com/deanius/promise) package to help us make our method calls using the JavaScript Promises syntax.

<p class="block-header">Terminal</p>

```bash
meteor add reactive-var
```
To help us communicate the "save state" of our documents, we'll use `ReactiveVar` to reactively set state in our template.

<div class="note">
  <h3>Additional Packages <i class="fa fa-warning"></i></h3>
  <p>This recipe relies on several other packages that come as part of <a href="https://github.com/themeteorchef/base">Base</a>, the boilerplate kit used here on The Meteor Chef. The packages listed above are merely recipe-specific additions to the packages that are included by default in the kit. Make sure to reference the <a href="https://github.com/themeteorchef/base#packages-included">Packages Included list</a> for Base to ensure you have fulfilled all of the dependencies.</p>
</div>

### What are we building?
So we're building a Markdown editor, but what exactly is that?

<figure>
  <img src="http://cl.ly/image/1G3P0m1x2X14/markdown-editor-preview.gif" alt="Markdown editor preview">
<figcaption>An example of the Markdown editor we'll be building.</figcaption>
</figure>

A GIF is worth a million words, friend. Pretty neat, right? We're going to build a real-time editor with a text editor on one side, and a live preview of whatever we type _in that editor_ rendered into HTML on the right. As a bonus, we'll see how to get what we've typed synced up with the the database, too, so our work is ready to go when we load the page. Not too shabby.

### What is Markdown?

Markdown is a pseudo-language for speeding up the process of writing HTML. Instead of writing out tags like `<h4>My title tag</h4>`, it allows us to use a special syntax like `#### My title tag`. Markdown is really great for things like writing blog posts because it allows you to quickly integrate different types of markup using a lean syntax. 

<p class="block-header">Markdown Example</p>

```markdown
This is just regular text.

This is **bolded text**.

This is *italicized text* and _so is this_.

This is [a link to something](http://google.com)

This is some `inline code`.
```

In fact, Markdown is powering this post! But wait...how does that work? Markdown isn't HTML, so how do browsers know how to display it?

#### Parsing Markdown
Just like any programming language needs to be converted into a more machine-friendly syntax, Markdown needs to be _parsed_ (or converted) into HTML. To do this, we can use a special tool known as a parser that follows a set of rules for converting our Markdown into raw HTML. Neat! We'll learn about this a little later on when we build a live preview for our Markdown editor.

### Creating documents
The first thing we need to do is setup our app to actually _create_ documents. To do this, we're going to setup a quick modal and load it as part of our `documents` template.

<div class="note">
  <h3>Skipping Ahead <i class="fa fa-warning"></i></h3>
  <p>We're going to skip over some of the simpler parts of this recipe like setting up a collection, templates, and routes. All of this is included in the <a href="https://github.com/themeteorchef/building-a-markdown-editor">repo over on GitHub</a>, though, so take a peek and ask questions if you get stuck!</p>
</div>

Let's hop over to the code for our `addNewDocumentsModal` template to wrap our head around it and then look at how we're accessing it from the `documents` template.

<p class="block-header">/clients/views/authenticated/add-new-document-modal.html</p>

```javascript
<template name="addNewDocumentModal">
  <div class="modal fade" id="new-document-modal" tabindex="-1" role="dialog" aria-labelledby="new-document-modal">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
          <h4 class="modal-title" id="myModalLabel">Start a New Document</h4>
        </div>
        <form id="new-document">
          <div class="modal-body">
            <label for="documentTitle">Document Title</label>
            <input type="text" name="documentTitle" class="form-control" placeholder="e.g. Plans for World Domination">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-success">Create Document</button>
          </div>
        </form> <!-- end #new-document -->
      </div>
    </div>
  </div>
</template>
```

Here, we're using a [Bootstrap modal]() to present a form for creating a new document. We're keeping things pretty spartan here and asking for just a title. There's a lot of markup here, but the part we'll focus on is the input field `<input type="text" name="documentTitle" class="form-control" placeholder="e.g. Plans for World Domination">`. [Document placeholder title](https://www.youtube.com/watch?v=oiOKh3odS4U) optional.

![Pinky and the Brain](http://media.giphy.com/media/3mKBXLpYeLzUY/giphy.gif)

One thing to point out is that because this is a modal, we expect it to _overlay_ something (as opposed to being a standalone template). Real quick, let's look at how we're including this in the `documents` template.

<p class="block-header">/client/views/authenticated/documents.html</p>

```javascript
<template name="documents">
  {{> addNewDocumentModal}}

  <h4 class="page-header">Documents</h4>

  <a href="#" class="btn btn-success add-new-document" data-toggle="modal" data-target="#new-document-modal">Start a New Document</a>

  <div class="list-group documents-list">
    {{#each documents}}
      <a class="list-group-item" href="{{pathFor 'editor'}}">{{title}}</a>
    {{else}}
      <p class="alert alert-warning">No documents yet, friend.</p>
    {{/each}}
  </div>
</template>
```

See it up there at the top `{{> addNewDocumentModal }}`? By the magic of Bootstrap, all we need to do is make sure the _markup_ for our modal is on screen by including our template. It handles the hiding/showing for us. Let's look at the logic for our modal so we can get an idea of how this is wired up.

<p class="block-header">/clients/controllers/authenticated/add-new-document-modal.js</p>

```javascript
Template.addNewDocumentModal.onRendered( function() {
  $( "#new-document" ).validate({
    rules: {
      documentTitle: {
        required: true
      }
    },
    messages: {
      documentTitle: {
        required: "Woah there, slick. Add a title please."
      }
    },
    submitHandler: function() {
      var title = $( "[name='documentTitle']" ).val();

      Meteor.call( 'insertDocument', title, function( error, response ) {
        if ( error ) {
          Bert.alert( error.reason, "danger" );
        } else {
          Router.go( "editor", { _id: response } );
          $( '#new-document-modal' ).modal( 'hide' );
          $( '.modal-backdrop' ).remove();
        }
      });
    }
  });
});

Template.addNewDocumentModal.events({
  'submit form': function( e ) {
    e.preventDefault();
  }
});
```

From the bottom up! Down below, we make sure to call `preventDefault()` on our forms submission event. This blocks the form from submitting to the server, but also helps us defer the actual submission action to our validation's `submitHandler` function up above.

Our validation here is simple: does a title exist? If not, we display our `"Woah there, slick. Add a title please."` message. If all is well, we move to our `submitHandler`. In there, we grab the document title from our form and then toss it up to our `insertDocument` method on the server. Let's hop over there real quick and see how this gets in the database. 

<p class="block-header">/server/methods/insert/documents.js</p>

```javascript
Meteor.methods({
  insertDocument: function( title ){
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
```
Pretty...underwhelming, eh? Nonetheless, very important. First, we check our `title` argument to make sure that it's a string. Next, we do something a little fancy. Instead of just inserting the document with a title only, we construct a `doc` object that we can insert. Notice, here, that we set the `title` key equal to the title we received from the client and then set two new fields: `owner` and `markdown`. 

That first one, `owner`, allows us to attach this document to the _currently logged in user_. What's nice about this is that notice we can get the user's ID on the server using `Meteor.userId()`. This helps us avoid passing the ID over from the client. We also add an empty `markdown` key with an empty value. As you might have guessed, we'll set this later on when we get fancy with our markdown in a little bit. For now, we include it so that it's defined on our object.

Lastly, we wire up our insert in a `try/catch` block. This allows us to call our insert method without a callback. Why would we do that? Well, when we do this, Meteor simply returns the new document's ID. That means we can assign that value to a variable and return it. We use a `try/catch` because if that insert were to fail for some reason, that error would be deferred to the `catch` function and returned to the client. Simple. Let's see what happens back over on the client once we have our ID. Hint: tons of fun.

<p class="block-header">/client/controllers/authenticated/add-new-document-modal.js</p>

```javascript
Meteor.call( 'insertDocument', title, function( error, response ) {
  if ( error ) {
   Bert.alert( error.reason, "danger" );
  } else {
   Router.go( "editor", { _id: response } );
   $( '#new-document-modal' ).modal( 'hide' );
   $( '.modal-backdrop' ).remove();
  }
});
```

If we get a pesky error, we toss it to [`Bert.alert()`](https://github.com/themeteorchef/bert) to let the user know what's up. If all is well, though, we grab the `response` argument from our method (this will be equal to our new document's ID) and pass it to Iron Router's `Router.go()` method. Notice how this first argument in that call is `"editor"`? This is letting Iron Router know which route we want to use by _it's name_. The latter part, where we pass an object with the `_id` key is telling Iron Router to set the route parameter for `_id` equal to our new document ID. What this does is redirect the user to our `editor` template for the new document. Confused? Let's take a look.

<p class="block-header">/client/routes/routes-authenticated.js</p>

```javascript
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
```

This is a little odd because even though our route and template are called `editor`, our path is pointed to `/documents/:_id`. Right! To keep our URL structure a little more predictable, we've opted for this path because it maps well to the list of documents. So we have `/documents` our list of documents, and `/documents/:_id` for a _single_ document. Make sense? This is purely stylistic and you could call your route whatever you wanted, like `/ryan/seriously/why/:_id`. Up to you!

Notice, though, that we want to set that `:_id` value back in our `Router.go()` call because Iron Router then passes that to our subscription for single documents, as well as sets our `currentDocument` Session variable so we can access it later. Phew.

With this done, we should be able to insert a new document and be redirected to the editor view! Yeah! Now for the sticky part: building out our editor.

### Setting up the editor
Now that we have documents stored in our database, we need to actually make them editable. How do we do it? First, let's look at our `editor` template and then build up the different pieces from there.

#### The editor template

<p class="block-header">/client/views/authenticated/editor.html</p>

```javascript
<template name="editor">
  <header class="editor-header">
    <label for="documentTitle">Title</label>
    <input type="text" name="documentTitle" value="{{document.title}}">
  </header>
  <div class="editor-preview">
    <div class="editor-wrap">
      <textarea id="editor"></textarea>
    </div>
    <div class="preview-wrap">
      <div id="preview"></div>
    </div>
  </div>
</template>
```
Now we get into the thick of it. Here, we're simply setting three things:

1. An input where we can both display and make changes to our document title.
2. A textarea with an id of `edtior` (where we'll load our CodeMirror editor).
3. An empty div with an id of `preview`.

These three parts make up our editor. We've got a good bit of work ahead of us to get them wired up. Don't worry, we'll look at all the tricky parts. First, though, let's chat about CSS.

#### The `.editor-view` class
We want our editor to look nice and spiffy and give us plenty of room for writing. To do this, we're going to add a little bit of CSS to our app, but, we only want to add that CSS when we're on the _editor_ view. How do we do that?

In Iron Router, we get access to a function called `onBeforeAction()` that can be called before every single route, or, a list of routes that we specify (or vice versa). We're going to make use of this to toggle a class on our `<body>` element whenever we're on the editor page and remove it when we're not. Let's take a peek.

<p class="block-header">/client/routes/hooks.js</p>

```javascript
var editorView = function(){
  var currentRoute = Router.current().route._path;
  if ( currentRoute === "/documents/:_id" ) {
    $( "body" ).addClass( "editor-view" );
    this.next();
  } else {
    $( "body" ).removeClass( "editor-view" );
    this.next();
  }
};
```

First, we create a function that we can call later. This is pretty simple, but quite powerful. We grab the current route's path by calling `Router.current().route._path`. In other words, this gives us the current page's path, or, everything _after_ the site's domain `http://localhost:3000`. Once we have this, we compare it against the path we're looking for as we defined it in our route: `/documents/:_id`. When the current path equals this value, it's as good as saying "we're on the editor view." Nice!

If we confirm we're in the editor view, we use a spot of jQuery to help us add a class `editor-view` to our `<body>` tag. Conversely, if we find we're _not_ on the editor path, we just go ahead and remove it. 

<div class="note">
  <h3>this.next <i class="fa fa-warning"></i></h3>
  <p>Because we'll be calling this function in Iron Router's onBeforeAction method, we need to produce a signal when our work is complete so that the router knows to continue. If we don't provide this, we'll set our class but our route won't execute leaving our page blank.</p>
</div> 

Calling this is quite simple:

<p class="block-header">/client/routes/hooks.js</p>

```javascript
Router.onBeforeAction( editorView );
```
A one liner! Here we just call `Router.onBeforeAction()`, passing our function we defined above. See how our function is the only argument? This is telling Iron Router to call this function before _every single route_. If we were to provide another argument containing an object with a key of either `except` or `only`, we could pass an array to that key with a list of route names we wanted to _avoid_ calling our function on, or isolate calling our function to, respectively. For reference:

```javascript
Router.onBeforeAction( editorView, {
  only: [
    'routeName',
    'anotherRouteName'
  ]
});
```
But wait, don't we only want to call this function on the editor view? Why not just specify that? Well, because we're setting a class name on our body, we need a way to remove it. If we were to specify `only` our editor view, when we moved away from that route the `editor-view` class would still be on the body! To get around that, we simply call our function on _all_ routes and specify the logic in our function.

<figure>
  <img src="http://cl.ly/image/3l17020m1711/markdown-editor-body-class.gif" alt="Example of editor-view class being applied while changing routes."> 
  <figcaption>Example of editor-view class being applied while changing routes.</figcaption>
</figure>

Cool! Notice how now, we can use our `editor-view` class to expand our layout to be 100% of the page to maximize our editing experience.

<div class="note info">
  <h3>Pre-Written CSS</h3>
  <p>Since we're JavaScript folk, we're going to skip over the CSS powering the editor. Don't fret, if you're curious how it's working, hop over to the repo and  <a href="#">check out the stylesheet</a>!</p>
</div>
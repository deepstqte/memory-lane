### Demo

[![Memory Lane App Demo - Watch Video](https://cdn.loom.com/sessions/thumbnails/68698b69fc564296a1e4acd87357415a-cd14eabf7bd60e89-full-play.gif)](https://www.loom.com/embed/68698b69fc564296a1e4acd87357415a?sid=6009bcb2-e674-4c4f-b08c-9bdfcf89fabe)

### UI

The Memory Lane app's UI is built with React and Bulma as the CSS components framework.

#### Pages

- User profile page (`/:userId`): This page shows a user's profile, it contain's the user's profile image that's pulled from the social auth account, their bio, and the list of all their memories. If the user logged is the owner of the profile, then they're able to update their bio in this page.
- Memories page (`/memories`): This page is also the home page. It contains a list all the memories created by all users.
- Memory page (`/:userId/:memoryId`): This page shows the enlarged version of the memory image, and all other memory info.

#### Modals

There are two modals in the app:

- A memory modal to either update an existing memory or create a new one.
- A bio modal to allow the user to update their bio.

#### Sorting

In any memory list view, memories can be sorted by users with two interactive toggle buttons; "Oldest First" or "Most Recent First," and this gives users control over the order that memories are listed in.

#### Validation and Feedback

Field validation is implemented in memory creation and editing modal. Necessary details must be input by users before submission. This improves usability.

### API

The backend RESTful API is implemented Node.js with Express. The API interacts with a PostgreSQL database via Neon which simplifies working with the DB. This is using Drizzle ORM for easy query abstraction and easy schema evolution management and migrations.

#### Database

![Database](/dbschema.svg)

For the `id` in the `Users` table, for simplicity, I'm using the `id` from WorkOS.

#### User Management, Authentication and Security

In order to simplify user management, authentication and authorization, the backend integrates with WorkOS. Session cookies, and CSRF tokens are used for authentication to protect sensitive operations, such as memory creation or deletion, from forbidden access and CSRF attacks.

While this wasn't required originally, I wasn't able to imagine a good enough UX and application without it.

WorkOS was implemented by only enabling social auth for the sake of this prototype. This is to pull user public info like the name and a profile photo and use them in the app without having the user to add them.

#### Memory CRUD Operations

The API allows users to actively create, read, update and delete memories through its dedicated endpoints, enabling easy management of memory data. It also allows them to update their bio.

#### Image Storage Integration

For an easy and efficient image storage and retrieval, the backend integrates with Cloudinary, enabling smooth image storage. Images that are uploaded are processed, cropped and delivered by Cloudinary's CDN.

The images are stored with the public id `:userId/:memoryId` which allows their url to be discoverable. This means that it's unnecessary to store the url in the DB and that all we need to retrieve a certain memory image is its id the creator's id.

### Deployment and Submission

For simplicity and time's sake, no tests were written but that's be the first step into taking this project further.

A dockerfile was added for each, the frontend React app, and API. They were deployed as Google CLoud Run services. Again for simplicity and time's sake, the docker image build uses the same process as local development for starting the services, and bundles all the codebase into each one of them, which is not optimal and could be improved.

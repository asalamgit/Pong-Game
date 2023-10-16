
### Folder Structure

- src/
   - ```core```
      - Router
      - user
         - useUserProvider.tsx
         - userContext.ts
      - auth
   - ```pages```
      - Profile
         - components
         - types
         - hooks
         - Profile.module.scss
         - Profile.tsx
         - index.ts
      - Chat
         ...
   - ```ui```
      - Modal
         - components
         - types
         - hooks
         - Modal.module.scss
         - Modal.tsx
         - index.ts
      - Header
         - components
         - types
         - hooks
         - Header.module.scss
         - Header.tsx
         - index.ts
   - ```styles```
      - global.css
      - medias-queries.scss
   - main.tsx
   - App.tsx
   ...


### How to write a component

```ts
import { JSX } from 'react';

type Props = {};

export function ComponentName(props: Props): JSX.Element {

   return <div>/*  JSX */</div>
}
```
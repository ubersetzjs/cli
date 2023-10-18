# 🌍 ubersetz.js

🚀 Welcome to ubersetz.js!

Tired of juggling localization files? Want to make your software globally friendly without the fuss? Ubersetz.js is here to redefine your localization game!

Why choose ubersetz.js? 🤔

* Inline Translations: Write your default language phrase alongside the phrase key directly in your code. No more hopping between files!
* Automated Extraction: Just set it up and let ubersetz.js find and store your phrases into a neat JSON file.
* Your Software, Many Languages: Start translating and make your software accessible to users worldwide in their native tongues.
🌐 With ubersetz.js, make your software not just multi-functional, but multi-lingual! 🎉

## Installation

```sh
  $ npm install ubersetz
```

## Usage

### configuration

create a file called `.ubersetzrc` in the root of your application
```js
{
  "baseLocale": "en",
  "extractionFile": "locales/extracted.json",
  "locales": [{
    "name": "English (US)",
    "code": "en-us",
    "file": "locales/en.locales.json"
  }, {
    "name": "German",
    "code": "de-de",
    "file": "locales/de.locales.json"
  }]
}
```

### register/translate a phrase in your code
```js
import u from 'ubersetz'

u('key_of_the_phrase, null, 'This is the translation in your default language')

// you can include variables too!
u('key_of_another_phrase, { name }, 'Hello {name}!')
```

### extract phrases
```js
  $ npx @ubersetz/cli .
```

### get/change the locale
```js
import { getLocale, setLocale }  from 'ubersetz'

console.log(getLocale()) // returns the current locale

setLocale('de', await import('./locales/de.locales.json')) // sets the locale and phrases
```


## License
Licensed under MIT license. Copyright (c) 2023 Max Nowack

## Contributions
Contributions are welcome. Please open issues and/or file Pull Requests.

## Maintainers
- Max Nowack ([maxnowack](https://github.com/maxnowack))

Happy localizing! ✨

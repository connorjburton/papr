# Papr

<div align="center">
	<img alt="Papr" height="125" src="docs/logo.webp" width="98" />
</div>

---

- TypeScript-safe schemas
- JSON Schema MongoDB validation
- :tada: Lightweight library
- :rocket: Blazing fast

---

![](https://github.com/plexinc/papr/actions/workflows/ci.yaml/badge.svg)

`papr` is a lightweight library built around the MongoDB NodeJS driver, written in TypeScript.

`papr` uses MongoDB's [JSON Schema validation](https://docs.mongodb.com/manual/core/schema-validation/#json-schema) feature to enable validation of document writes at runtime (requires MongoDB 3.6+).

`papr` has a familiar API - if you have used the raw `mongodb` methods to query and change documents before, then you already know how to use `papr`.

## Sample code

<!-- prettier-ignore -->
```ts
import Papr, { schema, types } from 'papr';

const papr = new Papr();

const User = papr.model('users', schema({
  age: types.number(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
}));

const johnWick = await User.find({ firstName: 'John', lastName: 'Wick' });
```

## Documentation

Read the documentation at: [plexinc.github.io/papr](https://plexinc.github.io/papr/)

## Contributing

This repository is following the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard.

## License

MIT

## Inspiration

- [Mongoose](https://mongoosejs.com/)
- [ts-mongoose](https://github.com/lstkz/ts-mongoose)

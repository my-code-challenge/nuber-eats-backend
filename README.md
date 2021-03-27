# Nuber Eats

The backend of nuber eats clone

```bash
NestJS
  ├─src
  │  ├─app.module.ts
  │  ├─main.ts
  │  ├─restaurants
  ├─test
  │  └─...test files
  └─eslint,env,prettier etc config files
```

## Core Entity:

- id
- createAt
- updateAt

## User Entity:

- email
- password
- role(client|owner|delivery) -> 손님 | 점원 | 배달원

## User CRUD:

- Create Account
- Log In
- See Profile
- Edit Profile
- Verify Email

## Restaurant Model

- name
- category
- address
- coverImage

## Challenge

#### User

[x] Create User/Profile
[x] Update Profile
[x] Verify Email
[x] Login
[x] Auth Middleware

#### Mail

[x] NestJS Mailer

#### Restaurant

[x] See Categories
[ ] See Restaurants by category (pagination)
[ ] See Restaurants (pagination)
[ ] See Restaurant

[x] Create Restaurant
[x] Edit Restaurant
[x] Delete Restaurant

#### Dish

[ ] Create Dish
[ ] Edit Dish
[ ] Delete Dish

#### TEST

[x] Unit test for User
[x] E2E test for User

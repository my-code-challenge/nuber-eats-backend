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

- [x] Create User/Profile
- [x] Update Profile
- [x] Verify Email
- [x] Login
- [x] Auth Middleware

#### Mail

- [x] NestJS Mailer

#### Restaurant

- [x] See Categories
- [x] See Restaurants by category (pagination)
- [x] See Restaurants (pagination)
- [x] Search Restaurant
- [x] See Restaurant

- [x] Create Restaurant (Owner)
- [x] Edit Restaurant (Owner)
- [x] Delete Restaurant (Owner)

#### Menu

- [x] Add MenuOption Entity
- [x] Create Menu
- [x] Edit Menu
- [x] Delete Menu

#### Order

- [ ] Orders CRUD
- [ ] Orders Subscription

#### Payment

- [ ] 'CRON JOB' Payments (paddle API)

#### TEST

- [x] Unit test for User
- [x] E2E test for User

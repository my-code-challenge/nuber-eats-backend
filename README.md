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

- [x] Create Orders
- [x] Read Orders
- [x] Edit Orders
- [ ] Delete Orders
- [x] Add Driver to Order
- [x] [Orders Subscription](https://www.npmjs.com/package/graphql-subscriptions)
  - [x] Pending Orders (Owner) `Subscription: newOrder, Trigger: createOrder(newOrder)`
  - [x] Read Order Status (Customer, Delivery, Owner) `Subscription: orderUpdate, Trigger: editOrder(orderUpdate)`
  - [x] Pending Pickup Order (Delivery) / 요리가 완료되면 배달원들에게 알리기 `Subscription: orderUpdate, Trigger: editOrder(orderUpdate)`

#### Payment

[Paddle 결제 시스템 사용](https://paddle.com)

1. 디지털 내용물만 결제 가능한 오픈 시스템
   1-1. 프리미엄 멤버십 결제
   1-2. 포인트 구매/판매 시스템
   1-3. 전자 e-book 구매/판매 시스템
2. 대부분 프론트엔드에서 결제 작업을 개발함
   Example Site) https://www.renderforest.com/
3. Cron Job -> Task Scheduling
   npm install --save @nestjs/schedule
   [Go Description](https://docs.nestjs.com/techniques/task-scheduling)
   [Cron jobs Guide](https://docs.nestjs.com/techniques/task-scheduling#declarative-cron-jobs)
   [Interval Guide](https://docs.nestjs.com/techniques/task-scheduling#declarative-intervals)
   [Timeout Guide](https://docs.nestjs.com/techniques/task-scheduling#declarative-timeouts)

- [x] Payment Module (Using paddle API)
- [x] 'CRON JOB' Payments

#### TEST

- [x] Unit test for User
- [x] E2E test for User

#### Description

> **[Relation Reference](https://typeorm.io/#/many-to-one-one-to-many-relations)** <br/> `OneToMany는 ManyToOne 없이 정의 할 수 없다.` <br/> `ManyToOne 관계에만 집중 하고 싶다면, 관련 entity에 OneToMany 없이 정의할 수 있다.`

---
date:   2019-07-07
title: "Writing Micro Service in Scala"
categories: 
    - Tutorials
excerpt: Writing a micro service in Scala using the concept of Hexagonal Architecture.
tags: 
    - Scala
    - Micro Service
    - Hexagonal Architecture
    - Finagle
    - Docker
---

{% include toc %}

# Overview 

<!-- This article was also published on the site: [https://dzone.com/articles/the-types-of-data-engineers](https://dzone.com/articles/the-types-of-data-engineers). -->

**Scala** is a language that I have been using extensively in my work, but with the focus on Big Data using Spark for data processing.

Scala was in my playlist of languages that I wanted to delve into a bit more and not only experiments for the area of Big Data 
using Spark, but to write a micro service using http and rest for studies.

The idea is to apply the concept of **Hexagonal Architecture** (ports and adapters). My micro-service is called a *Sparrow Account*, 
and the source code is available in GitHub. I also did a similar experiment in using the Clojure language that you can see in GitHub.

  * <a href="https://github.com/edersoncorbari/sparrow-account" target="_blank">https://github.com/edersoncorbari/sparrow-account</a>
  * <a href="https://github.com/edersoncorbari/small-bank" target="_blank">https://github.com/edersoncorbari/small-bank</a>

Let's go to the requirements.

## 1. Micro-Service requirements 

Create a micro-service that checks and creates a hypothetical bank account.

It must comprise a HTTP Server with two endpoints:

  * One to insert a new monetary transaction, money in or out, for a given user;
  * One to return a user's current balance.

Requirements:

  * It must not be possible to withdraw money for a given user when they don't have enough balance;
  * You should take concurrency issues into consideration;
  * Store data in memory;
  * Designer partners and good coding practices:
  * Immutability;
  * Separation of concerns;
  * Unit and integration tests;
  * API design;
  * Error handling;
  * Language idiomatic use;
  * Use functional programming paradigm.

### Proposed Solution:

The architecture of the proposed solution follows the Hexagonal Architecture concept. The design is based on two books:

  * <a href="https://www.amazon.com/dp/B00HUEG8KK" target="_blank">Functional Programming Patterns in Scala and Clojure</a>
  * <a href="https://www.amazon.com/dp/B075Z2CMRX" target="_blank">Scala Design Patterns</a>

Example Diagram of a Hexagonal Architecture:

![]({{ site.url }}{{ site.baseurl }}/assets/images/blog/ports-and-adapters.png)
{: .align-center}

Organization Application Package Diagram:

![]({{ site.url }}{{ site.baseurl }}/assets/images/blog/sparrow-account-pkg.png)
{: .align-center}

### 1.1 Http Rest Server

To build a request and response Http Rest Server, Finagle-Finch was used:

  * <a href="https://twitter.github.io/finagle/" target="_blank">https://twitter.github.io/finagle/</a>
  * <a href="https://finagle.github.io/finch/" target="_blank">https://finagle.github.io/finch/</a>

Piece of code where the server is used: <a href="https://github.com/edersoncorbari/sparrow-account/blob/master/src/main/scala/sparrow/account/ServerApp.scala" target="_blank">src/main/scala/sparrow/account/ServerApp.scala</a>

{%highlight scala%}
def runServer(): Unit = {
  val app = Http
    .server
    .withLabel(serverConf.name)
    .withAdmissionControl.concurrencyLimit(
    maxConcurrentRequests = serverConf.maxConcurrentRequests,
    maxWaiters = serverConf.maxWaiters
  ).serve(s"${serverConf.host}:${serverConf.port}",
  (Routes.balanceAccount :+: Routes.fillAccount).toService)
  onExit {
    app.close()
  }
  Await.ready(app)
}
{%endhighlight%}

The EndPoints available on the server:

| Method   |  EndPoint    |  Example Parameter             |
|:--------:|:------------:|:------------------------------:|
| POST     | /account     | {"uuid":"1", "amount":100.50}  |
| GET      | /balance     | not required                   |

Piece of code of the routes with the EndPoints: <a href="https://github.com/edersoncorbari/sparrow-account/blob/master/src/main/scala/sparrow/account/Routes.scala" target="_blank">src/main/scala/sparrow/account/ServerApp.scala</a>

{%highlight scala%}
final val fillAccount: Endpoint[Account] =
  post("account" :: jsonBody[AccountFillRequest]) {req: AccountFillRequest =>
    for {
      r <- accountService.fillAccount(req.uuid, req.amount)
    } yield r match {
      case Right(a) => Ok(a)
      case Left(m) => BadRequest(m)
    }
  }
{%endhighlight%}

There are two EndPoints *fillAccount* that can create an account and deposit a value, as well as can withdraw using the negative value. And the 
EndPoint *balanceAccount* to see the balance available to the user.

### 1.2 Transactional Memory and Concurrency Control

When we are talking about microservice, we have to guarantee the atomicity of the code, so that no undue competition occurs. To control 
concurrency the ScalaSTM was used.

  * <a href="https://nbronson.github.io/scala-stm/" target="_blank">https://nbronson.github.io/scala-stm/</a>

Piece of code where atomicity is used: <a href="https://github.com/edersoncorbari/sparrow-account/blob/master/src/main/scala/sparrow/account/controller/AccountController.scala" target="_blank">src/main/scala/sparrow/account/controller/AccountController.scala</a>

{%highlight scala%}
override def fillAccount(uuid: String, amount: Double): Future[Either[AccountFillException, AccountTransaction]] = Future {
  if (accounts.get(uuid).isEmpty) createAccount(uuid, 0)

  accounts.get(uuid) match {
    case Some(transact) => {
      atomic {implicit tx =>
        transact() = AccountTransaction(transact().uuid, transact().amount + amount)

        displayOperationType(transact().uuid, transact().amount)

        if (amountIsNegative(transact().amount))
          transact() = AccountTransaction(transact().uuid, transact().amount - amount)

        Right(transact())
      }
    }
    case _ => Left(AccountFillException("Fill account not found."))
  }
}
{%endhighlight%}

### 1.3 Other Tools Used

Other tools used in the project are in the order below:

  * <a href="https://github.com/lightbend/config" target="_blank">https://github.com/lightbend/config</a>
  * <a href="http://www.scalatest.org/" target="_blank">http://www.scalatest.org/</a>


### 1.4 Building the project

To build the project can follow the instructions in the own repository of the git hub located here:

  * <a href="https://github.com/edersoncorbari/sparrow-account" target="_blank">https://github.com/edersoncorbari/sparrow-account</a>

## Conclusion 

We saw in this short article how easy and simple it is to create a micro-service application using Scala language. It could 
also have used other libraries such as the <a href="https://akka.io/" target="_blank">AKKA</a> that I predict will soon make 
an article about it.

<b>Thanks!</b>

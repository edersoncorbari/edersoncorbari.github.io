---
date:   2018-11-03
title: "A small bank application with Clojure"
categories: 
    - Tutorials
excerpt: Building a small banking application using clojure with REST-API.
tags: 
    - Clojure 
    - Lisp
    - FreeBSD
    - Linux
    - REST API
    - HTTP
    - Bank
---

{% include toc %}

# Overview

[Clojure](https://en.wikipedia.org/wiki/Clojure) is a passionate language that uses strong mathematical expressoes for you to write a code, I think it's cool.
I am not a language expert, in fact in any language, I have a general profile, I decided to create a small banking application for study and testing purposes.

Before starting I will leave 3 book recommendations:

* [Practical Clojure By VanderHart, Luke](https://www.amazon.com/Practical-PRACTICAL-VanderHart-May-26-2010-Paperback/dp/B00BANVXZ2/ref=sr_1_5?s=books&ie=UTF8&qid=1541364172&sr=1-5&keywords=clojure+practical&dpID=41UyegO5xAL&preST=_SX218_BO1,204,203,200_QL40_&dpSrc=srch)
* [Professional Clojure By Jeremy Anderson](https://www.amazon.com/Professional-Clojure-Jeremy-Anderson/dp/1119267277/ref=sr_1_1?s=books&ie=UTF8&qid=1541364379&sr=1-1&keywords=professional+clojure&dpID=51lOOH6M%252BpL&preST=_SX218_BO1,204,203,200_QL40_&dpSrc=srch) It's rock and roll baby.
* [Clojure for the Brave and True](https://www.braveclojure.com)

# Tools

My Dexter's labs:

![Development Environment]({{ site.url }}{{ site.baseurl }}/assets/images/blog/clojure-developments-vm.png)
{: .align-center}

I've used clojure with [Leiningen](https://leiningen.org)and use the [Emacs](https://www.gnu.org/software/emacs/) editor that perfectly matches with Clojure. For more information check here:

* https://www.braveclojure.com/basic-emacs/

![Clojure Book]({{ site.url }}{{ site.baseurl }}/assets/images/blog/clojure-book-cover.png)
{: .align-center}

## 1. Project Design 

The idea of the small bank is to create a Rest API using Clojure, where the user can do:

* 1. Create a new account if there is no.
* 2. The user can put money into this account. 
* 3. The user can withdraw money from the account.
* 4. The multi-threaded system controls the concurrency of multiple concurrent accesses.
* 5. The operation is using a Rest Api.
* 6. Check account balance.

### 1.1 Start 

I did tests on the FreeBSD / Mac OS and Ubuntu operating systems you can download the project:

{%highlight bash%}
git clone https://github.com/edersoncorbari/small-bank.git
{%endhighlight%}

Now you need to raise the HTTP server.

{%highlight bash%}
./launch-app
{%endhighlight%}

By default the server uses port 3000. On another terminal run the curl response test:

{%highlight bash%}
/launch-curl
{%endhighlight%}

You should get the following outputs in response:

{%highlight bash%}
-------------------------------------------------------------------------------------

*** Simple Rest API to Check/Balance Small-Bank ***

Please use the (curl-api-test) script for testing.

-------------------------------------------------------------------------------------
Add money account: 1 -> Crediting: 316.22776601683793319988
:> Successful transaction
Add money account: 2 -> Crediting: 447.21359549995793928183
:> Successful transaction
Add money account: 3 -> Crediting: 547.72255750516611345696
:> Successful transaction
Add money account: 4 -> Crediting: 632.45553203367586639977
:> Successful transaction
Add money account: 5 -> Crediting: 707.10678118654752440084
:> Successful transaction
Add money account: 6 -> Crediting: 774.59666924148337703585
:> Successful transaction
Add money account: 7 -> Crediting: 836.66002653407554797817
:> Successful transaction
Add money account: 8 -> Crediting: 894.42719099991587856366
:> Successful transaction
Add money account: 9 -> Crediting: 948.68329805051379959966
:> Successful transaction
Add money account: 10 -> Crediting: 1000.00000000000000000000
:> Successful transaction
Add money account: 11 -> Crediting: 1048.80884817015154699145
:> Successful transaction
Add money account: 12 -> Crediting: 1095.44511501033222691393
:> Successful transaction
Add money account: 13 -> Crediting: 1140.17542509913797913604
:> Successful transaction
Add money account: 14 -> Crediting: 1183.21595661992320851346
:> Successful transaction
Add money account: 15 -> Crediting: 1224.74487139158904909864
:> Successful transaction

-------------------------------------------------------------------------------------
Get balance account: 1
{"account":1,"date":"2018-11-04T18:27:18.915-03:00","balance":316.22776601683796}
Get balance account: 2
{"account":2,"date":"2018-11-04T18:27:18.929-03:00","balance":447.21359549995793}
Get balance account: 3
{"account":3,"date":"2018-11-04T18:27:18.939-03:00","balance":547.7225575051662}
Get balance account: 4
{"account":4,"date":"2018-11-04T18:27:18.949-03:00","balance":632.4555320336759}
Get balance account: 5
{"account":5,"date":"2018-11-04T18:27:18.961-03:00","balance":707.1067811865476}
Get balance account: 6
{"account":6,"date":"2018-11-04T18:27:18.972-03:00","balance":774.5966692414834}
Get balance account: 7
{"account":7,"date":"2018-11-04T18:27:18.982-03:00","balance":836.6600265340755}
Get balance account: 8
{"account":8,"date":"2018-11-04T18:27:18.993-03:00","balance":894.4271909999159}
Get balance account: 9
{"account":9,"date":"2018-11-04T18:27:19.004-03:00","balance":948.6832980505138}
Get balance account: 10
{"account":10,"date":"2018-11-04T18:27:19.017-03:00","balance":1000.0}
Get balance account: 11
{"account":11,"date":"2018-11-04T18:27:19.026-03:00","balance":1048.8088481701516}
Get balance account: 12
{"account":12,"date":"2018-11-04T18:27:19.041-03:00","balance":1095.4451150103323}
Get balance account: 13
{"account":13,"date":"2018-11-04T18:27:19.056-03:00","balance":1140.175425099138}
Get balance account: 14
{"account":14,"date":"2018-11-04T18:27:19.066-03:00","balance":1183.2159566199232}
Get balance account: 15
{"account":15,"date":"2018-11-04T18:27:19.083-03:00","balance":1224.744871391589}

-------------------------------------------------------------------------------------
Remove money account: 1 -> Debting: 31.62277660168379331998
:> Successful transaction
Remove money account: 2 -> Debting: 44.72135954999579392818
:> Successful transaction
Remove money account: 3 -> Debting: 54.77225575051661134569
:> Successful transaction
Remove money account: 4 -> Debting: 63.24555320336758663997
:> Successful transaction
Remove money account: 5 -> Debting: 70.71067811865475244008
:> Successful transaction
Remove money account: 6 -> Debting: 77.45966692414833770358
:> Successful transaction
Remove money account: 7 -> Debting: 83.66600265340755479781
:> Successful transaction
Remove money account: 8 -> Debting: 89.44271909999158785636
:> Successful transaction
Remove money account: 9 -> Debting: 94.86832980505137995996
:> Successful transaction
Remove money account: 10 -> Debting: 100.00000000000000000000
:> Successful transaction
Remove money account: 11 -> Debting: 104.88088481701515469914
:> Successful transaction
Remove money account: 12 -> Debting: 109.54451150103322269139
:> Successful transaction
Remove money account: 13 -> Debting: 114.01754250991379791360
:> Successful transaction
Remove money account: 14 -> Debting: 118.32159566199232085134
:> Successful transaction
Remove money account: 15 -> Debting: 122.47448713915890490986
:> Successful transaction

-------------------------------------------------------------------------------------
Get balance account: 1
{"account":1,"date":"2018-11-04T18:27:19.359-03:00","balance":284.604989415154167}
Get balance account: 2
{"account":2,"date":"2018-11-04T18:27:19.372-03:00","balance":402.492235949962134}
Get balance account: 3
{"account":3,"date":"2018-11-04T18:27:19.382-03:00","balance":492.950301754649586}
Get balance account: 4
{"account":4,"date":"2018-11-04T18:27:19.394-03:00","balance":569.209978830308315}
Get balance account: 5
{"account":5,"date":"2018-11-04T18:27:19.405-03:00","balance":636.39610306789284}
Get balance account: 6
{"account":6,"date":"2018-11-04T18:27:19.416-03:00","balance":697.13700231733506}
Get balance account: 7
{"account":7,"date":"2018-11-04T18:27:19.429-03:00","balance":752.99402388066794}
Get balance account: 8
{"account":8,"date":"2018-11-04T18:27:19.440-03:00","balance":804.98447189992431}
Get balance account: 9
{"account":9,"date":"2018-11-04T18:27:19.450-03:00","balance":853.81496824546243}
Get balance account: 10
{"account":10,"date":"2018-11-04T18:27:19.463-03:00","balance":900.0}
Get balance account: 11
{"account":11,"date":"2018-11-04T18:27:19.473-03:00","balance":943.92796335313644}
Get balance account: 12
{"account":12,"date":"2018-11-04T18:27:19.483-03:00","balance":985.90060350929907}
Get balance account: 13
{"account":13,"date":"2018-11-04T18:27:19.494-03:00","balance":1026.1578825892242}
Get balance account: 14
{"account":14,"date":"2018-11-04T18:27:19.503-03:00","balance":1064.89436095793088}
Get balance account: 15
{"account":15,"date":"2018-11-04T18:27:19.513-03:00","balance":1102.27038425243009}
{%endhighlight%}

The above test add new accounts, then checks the balance, and then takes money out of the accounts. You can see more details of the implementation by looking at the project's README file.

* [https://github.com/edersoncorbari/small-bank](https://github.com/edersoncorbari/small-bank)

## Considerations

This is project is only used for studies using clojure, developed by layman in the subject and perhaps not one of the best implementations, techniques and use of the language.

MS Money QIF conversion for Moneyspire
===

_Removing duplicate transfer transactions from Money-exported QIF files before importing into MoneySpire_

Background
---

Microsoft Money reached end-of-life years ago, so it's beyond time for users to move to some other personal financial app. One option is [Moneyspire](https://www.moneyspire.com/).

Obviously users would like to import their current data into Moneyspire. This is done via a two step process: export an account's set of transactions from Money into a QIF file, and then import that QIF file into Moneyspire.

Unfortunately this has to be done for every (current) account in Money. Time-consuming, but it works.

The other issue is more problematic and it involves transfers between accounts. Imagine a transfer from a checking account to a credit card: the transaction is paying off (some of) the outstanding debt on the credit card. Because the QIF files are generated _per account_ that transfer (and all similar ones) appear in both QIF files for those accounts. Moneyspire makes no attempt to match up those duplicate transfer transactions and so, after importing all the QIF files, the balances calculated and displayed by Moneyspire are seriously wrong: _every_ transfer appears as two transactions in a given account.

Blog post: [Replacing Microsoft Money – Moneyspire](http://blog.boyet.com/blog/blog/replacing-microsoft-money-ndash-moneyspire/)

What this app does
---

In essence, it processes all the exported QIF files to remove these duplicate transfer transactions. A new QIF file is created for each original QIF file, and it is these new files that should be imported into Moneyspire. 

Requirements
---

This app is a [node.js](https://nodejs.org) app, so requires Node to be installed on the machine. There are two required libraries, however both are global and are installed with Node.

For simplicity, the code assumes that the exported QIF files are in the same folder as the app. It will process every QIF file it finds there, and creates a new QIF file for each, with "Fixed-" prepended to the filename. So, for example, `MyAccount.qif` gets processed and `Fixed-MyAccount.qif` is the resulting file.

So, copy all your QIF files in the same folder as the app, open a command prompt there, and run the app with:

`node convert.js`

How it works
---

The [QIF file format](https://en.wikipedia.org/wiki/Quicken_Interchange_Format) is a sight to behold. Basically each transaction appears as multiple lines, with the end of record signaled by an end of record `^` line. The app reads a complete multi-line record from the input QIF file and tries to determine if that record is a transfer transaction.

If the record is not a transfer, it is written exactly as read to the output file.

If it is a transfer (there will be a Category line with the name of an account enclosed in square brackets: for example `[MyAccount]`), the sign of the amount is then looked at. If negative the record is allowed through and is written to the output file; if positive, the record is ignored and is not written out.

(Aside: Why? Think of a transfer as being an active withdrawal from one account to a passive deposit in another. The receiving account, if you like, is just sitting there and money is dropped in on it. It is that side of the transaction which is being ignored by the app.)

(Crabby aside: If Moneyspire actually did something along these lines as it read in a QIF file, this app would not be necessary. Still waiting for this fix after reporting it 18 months ago.)

License
---

Standard MIT license.

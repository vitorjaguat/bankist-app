'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [


    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
    '2022-07-08T16:33:06.386Z',
    '2022-07-09T14:43:26.374Z',
    '2022-07-10T18:49:59.371Z',
    '2022-07-11T12:01:20.894Z',
    '2022-07-12T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2022-07-08T16:33:06.386Z',
    '2022-07-09T14:43:26.374Z',
    '2022-07-10T18:49:59.371Z',
    '2022-07-11T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

//Functions:

//Timer:
const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minutes
  let time = 300;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

//Format movement value and currency in UI:
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currentAccount.currency
  }).format(value);
};

//Format movement date in UI:
const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) => Math.round(Math.abs(date1 - date2) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday'
  if (daysPassed <= 7) return `${daysPassed} days ago`; else {

    //Display dates using Intl API:
    return new Intl.DateTimeFormat(locale).format(date);

    //Oldschool way:
    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
  }


}


const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  //Sort button:
  const movs = sort ? acc.movements.slice().sort((a, b) => a - b) : acc.movements;

  //Inserting HTML:
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    //Date:
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);



    //Pasting element:
    const html = `
    <div class="movements__row">
          <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
          <div class="movements__date">${displayDate}</div>
          <div class="movements__value">${formatCur(Math.abs(mov))}</div>
        </div>
        `;
    containerMovements.insertAdjacentHTML('afterbegin', html);

  })
}

//Calculating and displaying balance/summary
const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${formatCur(acc.balance)}`;
  // acc.balance = balance;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${formatCur(incomes)}`

  const outcomes = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${formatCur(Math.abs(outcomes))}`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => deposit * acc.interestRate / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${formatCur(interest)}`

}

// calcDisplaySummary(account1.movements);

//Creating the usernames. Each username is formed by the first letter of the owner's name and the first letter of the owner's lastname. This part of code adds the username property to each 'account' on the object 'accounts'.
const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

//Update UI function (refactoring display Ba;ance, Summary, Movements)
const updateUI = function (acc) {
  //Display movements
  displayMovements(acc);
  //Display balance
  calcDisplayBalance(acc)
  //Display summary
  calcDisplaySummary(acc)
}


//Event handlers:
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  e.preventDefault();

  currentAccount = accounts.find(acc => acc.username === inputLoginUsername.value);

  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    console.log(currentAccount);

    //Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); //the field loses its focus, ie, the cursor is not there blinking anymore
    //Display UI and message
    labelWelcome.textContent = `Welcome back, ${currentAccount.owner.split(' ')[0]}`;
    containerApp.style.opacity = 100;

    //Start timer:
    if (timer) clearInterval(timer);
    timer = startLogOutTimer();

    //Update UI
    updateUI(currentAccount)

    //CReate current date

    //Oldschool way:
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = now.getHours();
    // const minute = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minute}`;

    //Using Intl API:
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      // weekday: 'long'
    }
    const locale = currentAccount.locale;
    labelDate.textContent = new Intl.DateTimeFormat(locale, options).format(now);

  }
});




//Imprementing transfers:
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (amount > 0 && amount <= currentAccount.balance && receiverAcc && receiverAcc?.username !== currentAccount.username) {
    console.log('Transfer valid');
    //Doing the transfer:
    receiverAcc.movements.push(amount);
    currentAccount.movements.push(-amount)
    //Add transfer date:
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date());
    //Update UI:
    updateUI(currentAccount);
  }

  //Reset timer:
  if (timer) clearInterval(timer);
  startLogOutTimer();
});

//Loan:
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    //setTimeout:
    setTimeout(function () {
      //Add the positive movement:
      currentAccount.movements.push(amount);
      //Add loan date:
      currentAccount.movementsDates.push(new Date().toISOString());
      //Update UI:
      updateUI(currentAccount);
    }, 2500)
  }
  inputLoanAmount.value = '';

  //Reset timer:
  if (timer) clearInterval(timer);
  startLogOutTimer();
})


//Closing accounts:
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (inputCloseUsername.value === currentAccount.username && Number(inputClosePin.value) === currentAccount.pin) {
    //Select the index of the user to be removed:
    const index = accounts.findIndex(acc => acc.username === currentAccount.username);
    //Delete account:
    accounts.splice(index, 1);
    //Hide UI:
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
})

//Overall balance:
// const accountMovements = accounts.map(acc => acc.movements);
// const allMovements = accountMovements.flat();
// const overalBalance = allMovements.reduce((acu, mov) => acu+mov, 0);

//Using flat:
const overalBalance = accounts
  .map(acc => acc.movements)
  .flat()
  .reduce((acu, mov) => acu + mov, 0);

const overalBalance2 = accounts
  .flatMap(acc => acc.movements)
  .reduce((acu, mov) => acu + mov, 0);
console.log(overalBalance)


//Sort button (2/2):
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount.movements, !sorted);
  sorted = !sorted;
})


//FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

//Experimenting with the INtl API
// const now = new Date();
// labelDate.textContent = new Intl.DateTimeFormat('pt-BR').format(now);



/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////


//Filtering the deposits:
const deposits = movements.filter(function (mov) {
  return mov > 0; //only the items (mov) greater than 0 will be returned and make part of the array deposits.
})

const withdrawals = movements.filter(mov => mov < 0);
console.log(withdrawals)

//Reduce method!
//accumulator is like a snowball
//cur -> current value
//0 is the initial value of the accumulator
const balance = movements.reduce(function (acc, cur, i, arr) {
  console.log(`Iteration ${i}: ${acc}`)
  return acc + cur
}, 0)
console.log(balance)
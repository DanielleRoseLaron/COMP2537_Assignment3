const EASY_PAIRS   = 3
const MEDIUM_PAIRS = 6
const HARD_PAIRS   = 8

const EASY_COLS   = 3
const MEDIUM_COLS = 4
const HARD_COLS   = 4

const EASY_TIME   = 60
const MEDIUM_TIME = 90
const HARD_TIME   = 120

let currentDifficulty = 'easy'
let allCards          = []
let totalClicks       = 0
let timeLeft          = 0
let timerInterval     = null
let isRunning         = false
let peeksLeft         = 3

const grid             = document.getElementById('game_grid')
const overlay          = document.getElementById('overlay')
const overlayTitle     = document.getElementById('overlay_title')
const overlayMessage   = document.getElementById('overlay_message')
const overlayButton    = document.getElementById('overlay_button')
const loadingText      = document.getElementById('loading')
const startButton      = document.getElementById('start_button')
const resetButton      = document.getElementById('reset_button')
const peekButton       = document.getElementById('peek_button')
const timerDisplay     = document.getElementById('timer')
const clicksDisplay    = document.getElementById('clicks')
const matchedDisplay   = document.getElementById('matched')
const pairsLeftDisplay = document.getElementById('pairs_left')
const totalDisplay     = document.getElementById('total')
const peeksDisplay     = document.getElementById('peeks')
const themeButton      = document.getElementById('theme_button')

themeButton.addEventListener('click', function ()
{
  const html = document.documentElement

  if (html.getAttribute('data-theme') === 'dark')
  {
    html.setAttribute('data-theme', 'light')
    themeButton.textContent = 'Light'
  }
  else
  {
    html.setAttribute('data-theme', 'dark')
    themeButton.textContent = 'Dark'
  }
})

const difficultyButtons = document.querySelectorAll('.difficulty_button')

for (let i = 0; i < difficultyButtons.length; i++)
{
  difficultyButtons[i].addEventListener('click', function ()
  {
    if (isRunning)
    {
      return
    }

    for (let j = 0; j < difficultyButtons.length; j++)
    {
      difficultyButtons[j].classList.remove('active')
    }

    difficultyButtons[i].classList.add('active')
    currentDifficulty = difficultyButtons[i].dataset.difficulty
  })
}

function getPairs()
{
  if (currentDifficulty === 'easy')
  { 
    return EASY_PAIRS 
  }
  if (currentDifficulty === 'medium') 
  {
    return MEDIUM_PAIRS 
  }
  return HARD_PAIRS
}

function getCols()
{
  if (currentDifficulty === 'easy') 
  {
    return EASY_COLS 
  }
  if (currentDifficulty === 'medium')
  { 
    return MEDIUM_COLS 
  }
  return HARD_COLS
}

function getTime()
{
  if (currentDifficulty === 'easy')
  {
    return EASY_TIME 
  }
  if (currentDifficulty === 'medium') 
  {
    return MEDIUM_TIME 
  }
  return HARD_TIME
}

async function fetchPokemon(count)
{
  const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1025')
  const data     = await response.json()

  const shuffled = data.results.sort(function ()
  {
    return Math.random() - 0.5
  })

  const picked = []

  for (let i = 0; i < count; i++)
  {
    picked.push(shuffled[i])
  }

  const pokemonList = []

  for (let i = 0; i < picked.length; i++)
  {
    const detailResponse = await fetch(picked[i].url)
    const detail         = await detailResponse.json()

    pokemonList.push({
      id:   detail.id,
      name: detail.name,
      img:  detail.sprites.other['official-artwork'].front_default,
    })
  }

  return pokemonList
}

function shuffleArray(array)
{
  for (let i = array.length - 1; i > 0; i--)
  {
    const randomIndex  = Math.floor(Math.random() * (i + 1))
    const temp         = array[i]
    array[i]           = array[randomIndex]
    array[randomIndex] = temp
  }

  return array
}

function updateStatus()
{
  const totalPairs   = getPairs()
  const matchedPairs = document.querySelectorAll('.card.matched').length / 2

  matchedDisplay.textContent   = matchedPairs
  pairsLeftDisplay.textContent = totalPairs - matchedPairs
  totalDisplay.textContent     = totalPairs
  clicksDisplay.textContent    = totalClicks
}

function updateTimer()
{
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  let secondsString = ''

  if (seconds < 10)
  {
    secondsString = '0' + seconds
  }
  else
  {
    secondsString = '' + seconds
  }

  timerDisplay.textContent = minutes + ':' + secondsString

}

function endGame(playerWon)
{
  clearInterval(timerInterval)

  isRunning           = false
  peekButton.disabled = true

  setTimeout(function ()
  {
    if (playerWon)
    {
      overlayTitle.textContent   = 'You Win!!'
      overlayMessage.textContent = 'Matched all pairs in ' + totalClicks + ' clicks!'
    }
    else
    {
      overlayTitle.textContent   = 'Game Over!!'
      overlayMessage.textContent = 'You matched ' + (document.querySelectorAll('.card.matched').length / 2) + ' of ' + getPairs() + ' pairs.'
    }

    overlay.classList.remove('hidden')
  }, 300)
}

function setup()
{
  let firstCard  = undefined
  let secondCard = undefined
  let isLocked   = false

  const allCardElements = document.querySelectorAll('.card')

  for (let i = 0; i < allCardElements.length; i++)
  {
    allCardElements[i].addEventListener('click', function ()
    {
      if (!isRunning) 
      {
        return 
      }
      if (isLocked) 
      {
        return 
      }
      if (this.classList.contains('matched')) 
      {
        return 
      }
      if (this === firstCard) 
      {
        return
      }

      this.classList.add('flip')

      if (!firstCard)
      {
        firstCard = this
      }
      else
      {
        secondCard = this
        isLocked   = true
        totalClicks++
        updateStatus()

        const firstImage  = firstCard.querySelector('.front_face img')
        const secondImage = secondCard.querySelector('.front_face img')

        if (firstImage.src === secondImage.src)
        {
          firstCard.classList.add('matched')
          secondCard.classList.add('matched')

          firstCard  = undefined
          secondCard = undefined
          isLocked   = false

          updateStatus()

          if (document.querySelectorAll('.card.matched').length === getPairs() * 2)
          {
            endGame(true)
          }
        }
        else
        {
          const cardToFlipBack1 = firstCard
          const cardToFlipBack2 = secondCard

          setTimeout(function ()
          {
            cardToFlipBack1.classList.remove('flip')
            cardToFlipBack2.classList.remove('flip')

            firstCard  = undefined
            secondCard = undefined
            isLocked   = false
          }, 1000)
        }
      }
    })
  }
}

async function startGame()
{
  clearInterval(timerInterval)

  totalClicks = 0
  timeLeft    = getTime()
  peeksLeft   = 3
  isRunning   = false

  grid.style.setProperty('--cols', getCols())
  overlay.classList.add('hidden')
  grid.innerHTML = ''

  updateStatus()

  startButton.disabled     = true
  resetButton.disabled     = false
  peekButton.disabled      = true
  peeksDisplay.textContent = peeksLeft
  timerDisplay.textContent = '--'

  loadingText.classList.remove('hidden')

  try
  {
    const pokemonList = await fetchPokemon(getPairs())
    const doubled     = pokemonList.concat(pokemonList)
    const shuffled    = shuffleArray(doubled)

    allCards = shuffled

    for (let i = 0; i < shuffled.length; i++)
    {
      const card = document.createElement('div')
      card.className = 'card'

      const frontFace = document.createElement('div')
      frontFace.className = 'front_face'

      const image = document.createElement('img')
      image.src = shuffled[i].img
      image.alt = shuffled[i].name

      const nameLabel = document.createElement('span')
      nameLabel.className   = 'pokemon_name'
      nameLabel.textContent = shuffled[i].name

      frontFace.appendChild(image)
      frontFace.appendChild(nameLabel)

      const backFace = document.createElement('div')
      backFace.className = 'back_face'

      card.appendChild(frontFace)
      card.appendChild(backFace)

      grid.appendChild(card)
    }

    loadingText.classList.add('hidden')

    isRunning           = true
    peekButton.disabled = false

    updateTimer()

    timerInterval = setInterval(function ()
    {
      timeLeft--
      updateTimer()

      if (timeLeft <= 0)
      {
        clearInterval(timerInterval)
        endGame(false)
      }
    }, 1000)

    setup()
  }
  catch (error)
  {
    loadingText.classList.add('hidden')
    startButton.disabled = false
    console.error(error)
    alert('Could not load Pokemon.')
  }
}

function resetGame()
{
  clearInterval(timerInterval)

  isRunning   = false
  totalClicks = 0

  grid.innerHTML = ''
  overlay.classList.add('hidden')

  timerDisplay.textContent     = '--'
  clicksDisplay.textContent    = '0'
  matchedDisplay.textContent   = '0'
  pairsLeftDisplay.textContent = '0'
  totalDisplay.textContent     = '0'
  peeksDisplay.textContent     = '3'

  startButton.disabled = false
  resetButton.disabled = true
  peekButton.disabled  = true
}

function activatePeek()
{
  if (!isRunning)
  { 
    return 
  }
  if (peeksLeft <= 0) 
  {
    return 
  }

  peeksLeft--
  peeksDisplay.textContent = peeksLeft

  if (peeksLeft === 0)
  {
    peekButton.disabled = true
  }

  const allCardElements = document.querySelectorAll('.card')

  for (let i = 0; i < allCardElements.length; i++)
  {
    if (!allCardElements[i].classList.contains('matched') && !allCardElements[i].classList.contains('flip'))
    {
      allCardElements[i].classList.add('peek')
    }
  }

  setTimeout(function ()
  {
    for (let i = 0; i < allCardElements.length; i++)
    {
      allCardElements[i].classList.remove('peek')
    }
  }, 3000)
}

startButton.addEventListener('click', startGame)
resetButton.addEventListener('click', resetGame)
peekButton.addEventListener('click', activatePeek)

overlayButton.addEventListener('click', function ()
{
  overlay.classList.add('hidden')
  resetGame()
  startGame()
})
// FRONT-END (CLIENT) JAVASCRIPT HERE

const submit = async function( event ) {
  const form = event.currentTarget
  if (!form.checkValidity()) {
    form.reportValidity()
    return
  }

  // stop form submission from trying to load
  // a new .html page for displaying results...
  // this was the original browser behavior and still
  // remains to this day
  event.preventDefault()
  
  const itemVal = document.querySelector( '#item' ),
        categoryVal = document.querySelector( '#category' ),
        quantityVal = document.querySelector( '#quantity' ),
        utilizationVal = document.querySelector( '#utilization' ),
        json = { item: itemVal.value, category: categoryVal.value, quantity: quantityVal.value, utilization: utilizationVal.value },
        body = JSON.stringify( json )

  const response = await fetch( '/submit', {
    method:'POST',
    body 
  })

  const text = await response.text()
  const data = JSON.parse(text)

  itemVal.value = ''
  quantityVal.value = ''

  renderTable(data)

  console.log( 'text:', text )
}

const renderTable = function( appdata ) {
  const tbody = document.querySelector( '#grocery-table tbody' )
  if (!tbody) return

  tbody.innerHTML = ''

  appdata.forEach( (entry, index) => {
    const row = document.createElement( 'tr' )
    row.innerHTML = `
      <td>${entry.item}</td>
      <td>${entry.category}</td>
      <td>${entry.quantity}</td>
      <td>${entry.utilization}</td>
      <td>${entry.status || ''}</td>
      <td> <button onclick="deleteRow(${index})">Delete</button> </td>
    `
    tbody.appendChild( row )
  })
}

async function deleteRow(index) {
  // const row = button.parentNode.parentNode;
  // row.remove();
  console.log(index)
  const response = await fetch( `/data/${index}`, {
    method: 'DELETE'
  })
  const text = await response.text()
  const data = JSON.parse(text)
  renderTable(data)
}

const fetchData = async function() {
  const response = await fetch( '/data' )
  const text = await response.text()
  const data = JSON.parse(text)
  renderTable(data)
}

window.onload = function() {
  const form = document.querySelector('#groceries')
  form.addEventListener('submit', submit)
  fetchData()
}

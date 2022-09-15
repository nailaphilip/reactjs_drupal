import React from 'react';
import events from 'events'
import ajax from './ajax'
import './App.css';

// Create an emitter object so that we can do pub/sub
const emitter = new events.EventEmitter();

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src="https://cdn.pixabay.com/photo/2015/09/11/08/48/banner-935470_1280.jpg" alt="logo" />
        <p>
          React - Progressively Decoupled / Headless  
        </p>
        <a
          className="App-link"
          href="https://github.com/kalwar/reactjs_drupal"
          target="_blank"
          rel="noopener noreferrer"
        >
          Source Code
        </a>
      </header>
      <main>
        <div className="node-list">
          <h3>Nodes with Title, ContentID and Operation in Drupal</h3>
          <NodeList />
        </div>
        <NodeForm />
      </main>
    </div>
  );
}

// component to show a list of nodes
class NodeList extends React.Component {
  constructor() {
    super()
    this.state = {
      nodes: []
    }
    this.refresh = this.refresh.bind(this)
  }

  componentWillMount () {
    emitter.addListener('NODE_UPDATED', this.refresh)
  }

  componentWillUnmount () {
    emitter.addListener('NODE_UPDATED', this.refresh)
  }

  async componentDidMount() {
    await this.refresh()
  }

  async refresh () {
    // AJAX fetch server/node/rest?_format=json and setState with the response data
    try {
      const axios = await ajax() // wait for an initialized axios object
      const response = await axios.get('/node/rest/') // wait for the POST AJAX request to complete
      console.log(response.data);
      if (response.data) {
        // setState will trigger repaint
        console.log(response.data);
        this.setState({ nodes: response.data })
      }
      } catch (e) {
      alert(e)
    }
  }

  render () {
    const deleteNode = async (nid) => {
      try {
        const axios = await ajax() // wait for an initialized axios object
        const response = await axios.delete(`/node/${nid}`) // wait for the DELETE AJAX request to complete
        console.log('Node deleted', response)
        emitter.emit('NODE_UPDATED')
      } catch (e) {
        alert(e)
      }
    }
     
    return (
      <table>
        <thead>
          <tr>
            <td>Title</td>
            <td>Content ID</td>
            <td>Operations</td>
          </tr>
        </thead>
        <tbody>
          {this.state.nodes.map((node, index) => {
            // iterate over the nodes array and map them to "li" elements
            return (
              <tr key={index}>
                <td><a href={node}>{node.title[0].value}</a></td>
                <td>{node.nid[0].value}</td>
                <td><button onClick={e => deleteNode(node.nid[0].value)}>x</button></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
}

const NodeForm = () => {
  const data = {}
  // note the 'async' keyword, it allows us to call 'await' later
  const handleSubmit = async (e) => {
    e.preventDefault()
    const node = {     
      type: [{
        target_id: 'article',
        target_type: 'node_type',
      }],
      title: [{
        value: data.title,
      }],
      body: [{
        value: data.body,
        format: 'plain_text',
      }],
    };
    try {
      const axios = await ajax() // wait for an initialized axios object
      const response = await axios.post('/node/', node) // wait for the POST AJAX request to complete
      console.log('Node created: ', response.data)
      emitter.emit('NODE_UPDATED')
    } catch (e) {
      alert(e)
    }
  }
  const handleChange = (e, propName) => {
    data[propName] = e.target.value
  }

  return (
    <div className="create-node-form">
      <h4>Create Node Form</h4>
      <form onSubmit={handleSubmit}>
        <label>Title</label>
        <br />
        <input type="text" onChange={e => handleChange(e, 'title')}></input>
        <br />
        <label>Body</label>
        <br />
        <textarea onChange={e => handleChange(e, 'body')}></textarea>
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}

export default App;

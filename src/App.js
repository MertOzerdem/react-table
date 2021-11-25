import './App.css';
import Table from './components/Table/Table.js'
import {tableData} from './components/dummyData';

function App() {
  return (
    <div className="App">
      <Table data={tableData}>
        <div>
          <button></button>
        </div>
      </Table>
    </div>
  );
}

export default App;

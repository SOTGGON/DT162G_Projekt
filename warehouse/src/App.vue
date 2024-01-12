<template>
  <div class="common-layout">
    <el-container>

      <el-dialog v-model="dialogVisible" title="Ny produkt" :before-close="handleClose" width="60%">
        <span>
          <el-form :inline="true" :model="product" class="demo-form-inline">
            <el-divider content-position="left">Grund information</el-divider>

            <el-form-item label="Produkt ID">
              <el-input v-model="product.id" placeholder="Produkt ID" clearable />
            </el-form-item>

            <el-form-item label="Produkt Namn">
              <el-input v-model="product.name" placeholder="Produkt Namn" clearable />
            </el-form-item>

            <el-form-item label="Produkttyper">
              <el-select v-model="product.type" placeholder="Produkttyper" clearable>
                <el-option label="Spannmålsprodukter" value="grainproducts" />
                <el-option label="Stärkelseprodukter" value="starchproducts" />
                <el-option label="Vegetabiliska produkter" value="vegetableproducts" />
                <el-option label="Fruktprodukter" value="fruitproducts" />
                <el-option label="Köttprodukter" value="meatproducts" />
                <el-option label="Fjäderfäprodukter" value="poultryproducts" />
                <el-option label="Äggprodukter" value="eggproducts" />
                <el-option label="Mejeriprodukter" value="dairyproducts" />
                <el-option label="Godis" value="candy" />
                <el-option label="Snacks" value="snacks" />
              </el-select>
            </el-form-item>

            <el-form-item label="Antal produkt">
              <el-input v-model.number="product.count" />
            </el-form-item>

            <el-form-item label="Hållbarhetstid">
              <el-date-picker v-model="product.date" type="date" placeholder="Pick a date" clearable />
            </el-form-item>

            <el-divider content-position="left">Övriga</el-divider>

            <el-form-item label="Beskrivning">
              <el-input v-model="product.description" placeholder="Beskrivning" type="textarea" clearable />
            </el-form-item>
          </el-form>
        </span>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">Cancel</el-button>
            <el-button type="primary" @click="dialogVisible = false">
              Confirm
            </el-button>
          </span>
        </template>
      </el-dialog>

      <el-header><el-icon>
          <EditPen />
        </el-icon> Lagerhantering</el-header>

      <el-form :inline="true" :model="search" class="demo-form-inline" size="mini">
        <el-form-item label="Produktnummer(ID)">
          <el-input v-model="search.id" placeholder="Exakt sökning" clearable />
        </el-form-item>

        <el-form-item label="Produktnamn">
          <el-input v-model="search.name" placeholder="Luddig sökning" clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="searchProduct">Söka</el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="success" @click="dialogVisible = true">Lägga till</el-button>
        </el-form-item>
      </el-form>

      <el-main>
        <el-table :data="tableData" style="width: 100%">
          <el-table-column fixed prop="id" label="Produkt ID" />
          <el-table-column prop="name" label="Produkt Namn" />
          <el-table-column prop="type" label="Produkttyper" />
          <el-table-column prop="count" label="Antal produkt" />
          <el-table-column prop="date" label="Hållbarhetstid" />
          <el-table-column prop="description" label="Beskrivning" />
          <el-table-column fixed="right" label="Operations">
            <template #default>
              <el-button type="primary" size="small" @click="handleClick">Detail</el-button>
              <el-button type="danger" size="small">Edit</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ElMessageBox } from 'element-plus'
import { StarFilled } from '@element-plus/icons-vue'

// Sökning
const search = reactive({
  id: '',
  name: ''
})

const searchProduct = () => {
  console.log('submit!')
}

const handleClick = () => {
  console.log('click')
}

// Tabel
const tableData = [
  {
    id: '2016-05-03',
    name: 'Tom',
    type: 'California',
    count: 'Los Angeles',
    date: 'No. 189, Grove St, Los Angeles',
    description: 'CA 90036',
    tag: 'Home',
  },
  {
    id: '2016-05-03',
    name: 'Tom',
    type: 'California',
    count: 'Los Angeles',
    date: 'No. 189, Grove St, Los Angeles',
    description: 'CA 90036',
    tag: 'Office',
  },
  {
    id: '2016-05-03',
    name: 'Tom',
    type: 'California',
    count: 'Los Angeles',
    date: 'No. 189, Grove St, Los Angeles',
    description: 'CA 90036',
    tag: 'Home',
  },
  {
    id: '2016-05-03',
    name: 'Tom',
    type: 'California',
    count: 'Los Angeles',
    date: 'No. 189, Grove St, Los Angeles',
    description: 'CA 90036',
    tag: 'Office',
  },
]

// Tillläggnings form
const dialogVisible = ref(false)

const handleClose = (done) => {
  ElMessageBox.confirm('Are you sure to close this dialog?')
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
}

const product = reactive({
  id: '',
  name: '',
  type: '',
  count: 0,
  date: '',
  description: ''
})

const checkCount = (rule, value, callback) => {
  if (!value) {
    return callback(new Error('Please input the count'));
  }
  setTimeout(() => {
    if (!Number.isInteger(value)) {
      callback(new Error('Please input digits'));
    } else {
      if (value < 18) {
        callback(new Error('Count must be greater than 18'));
      } else {
        callback();
      }
    }
  }, 1000);
}
</script>

<style scoped>
body {
  margin-top: 0px;
  margin-left: 0px;
  margin-left: 0px;

}

.el-header {
  background-color: #B3C0D1;
  color: #333;
  text-align: center;
  line-height: 60px;
  margin-bottom: 1rem;
}

/* .el-main {
  background-color: #E9EEF3;
  color: #333;
  text-align: center;
  line-height: 160px;
} */

.el-form {
  text-align: center;
  justify-content: center;
}


.el-input {
  --el-input-width: 100%;
}

.el-select {
  min-width: 150px;
}

.el-date-picker {
  width: 10px;
}
</style>

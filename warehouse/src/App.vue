<template>
  <div class="common-layout">
    <el-container>

      <el-dialog v-model="dialogVisible" :title="dialogTitle" :before-close="handleClose" width="60%">
        <span>
          <el-form :inline="true" :model="product" class="demo-form-inline">
            <el-divider content-position="left">Grund information</el-divider>

            <el-form-item label="Produkt ID" prop="pid">
              <el-input v-model="product.pid" placeholder="Produkt ID" clearable />
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
            <el-button @click="close()">Cancel</el-button>
            <el-button type="primary" @click="addAndUpdate">Confirm</el-button>
          </span>
        </template>
      </el-dialog>

      <el-header><el-icon @click="fetch">
          <EditPen />
        </el-icon> Matlagerhantering</el-header>

      <el-form :inline="true" :model="search" class="demo-form-inline">
        <el-form-item label="Produktnummer(ID)" prop="pid">
          <el-input v-model="search.pid" placeholder="Exakt sökning" clearable />
        </el-form-item>

        <el-form-item label="Produktnamn" prop="name">
          <el-input v-model="search.name" placeholder="Luddig sökning" clearable />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit">Söka</el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="success" @click="addInfo">Lägga till</el-button>
        </el-form-item>
      </el-form>

      <el-main>
        <el-table :data="foodList" style="width: 100%">
          <el-table-column fixed prop="_id" label="ID" />
          <el-table-column prop="pid" label="Produkt ID" />
          <el-table-column prop="name" label="Produkt Namn" />
          <el-table-column prop="type" label="Produkttyper" />
          <el-table-column prop="count" label="Antal produkt" />
          <el-table-column prop="date" label="Hållbarhetstid" />
          <el-table-column prop="description" label="Beskrivning" />
          <el-table-column fixed="right" label="Operations">
            <template #default="{ row }">
              <el-button type="primary" size="small" @click="edit(row._id)">Redigera</el-button>
              <el-button type="danger" size="small" @click="remove(row._id)">Radera</el-button>
            </template>
          </el-table-column>
        </el-table>

        <div class="block" style='text-align:right;margin-top:10px'>
          <el-pagination @current-change="currentChange" layout="prev, pager, next" :page-size="page.size"
            :current-page="page.current" :total="page.total">
          </el-pagination>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { ElMessageBox } from 'element-plus';
//import { StarFilled } from '@element-plus/icons-vue';
import axios from 'axios';
import { onMounted } from 'vue';

const search = reactive({
  pid: '',
  name: ''
});

const foodList = ref([]);

const dialogVisible = ref(false);

const product = reactive({
  _id: '',
  pid: '',
  name: '',
  type: '',
  count: 0,
  date: '',
  description: ''
});

const page = reactive({
  current: 1,
  size: 10,
  total: 0
});

const rules = reactive({
  pid: [
    { required: true, message: 'ProduktID får inte vara tomt', trigger: 'blur' }
  ],

  name: [
    { required: true, message: 'Produktnamnet får inte vara tomt', trigger: 'blur' }
  ]
});

const dialogTitle = ref('');
/* const id = ref(''); */

onMounted(async () => {
  pageInation();
});

const handleClose = (done) => {
  ElMessageBox.confirm('Are you sure to close this dialog?')
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

/* const checkCount = (rule, value, callback) => {
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
} */

const fetch = () => {
  search.name = '';
  page.current = 1;
  pageInation();
};

const addInfo = () => {
  dialogTitle.value = "Lägga till produkt information";
  dialogVisible.value = true;
};

const add = async (pageInation) => {
  try {
    delete product._id;
    
    await axios.post('http://localhost:3001/add', product);
    // Rensa informationen i inmatningsrutan:
    product.pid = '';
    product.name = '';
    product.type = '';
    product.count = 0;
    product.date = '';
    product.description = '';

    // Dölj inmatningsruta:
    dialogVisible.value = false;

    ElMessage.success({
      message: 'Produkt tilllagd',
      type: 'success'
    });

    page.current = 1;
    pageInation();
  } catch (error) {
    console.error('Det gick inte att lägga till produkt:', error);
  }
};


const remove = async (id) => {
  console.log('Clicked Remove button with id:', id);
  
  if (id) {
    console.log('Product ID to be removed:', id);
    await axios.delete(`http://localhost:3001/delete/${id}`);
    console.log('Deleted successfully');
    pageInation();
  } else {
    console.error('Invalid id');
  }
};

/* const productId = ref(null);
const remove = async (id) => {
  try {
    await axios.delete(`http://localhost:3001/delete/${id}`);

    ElMessage.success({
      message: '删除成功',
      type: 'success'
    });

    pageInation();
  } catch (error) {
    console.error('Error deleting:', error);
  }
};


const handleRemove = async (id) => {
  try {
    console.log('Scope:', scope);

    if (!scope || !scope.row || !scope.row._id) {
      console.error('Invalid Product ID');
      return;
    }

    const productId = scope.row._id;

    const confirmed = await showDeleteConfirmationDialog();

    if (confirmed) {
      await remove(productId);
    }
  } catch (error) {
    console.error('Error handling remove:', error);
  }
};



// Funktion som öppnar dialogrutan för bekräftelse av borttagning
const showDeleteConfirmationDialog = async () => {
  return new Promise((resolve) => {
    ElMessageBox.confirm('Bekräfta att radera?', 'Tips', {
      confirmButtonText: 'Ja',
      cancelButtonText: 'Nej',
      type: 'warning',
      center: true
    }).then(() => {
      // Användaren klickade på Ja-knappen
      resolve(true);
    }).catch(() => {
      // Användaren klickade på Nej-knappen
      resolve(false);
    });
  });
}; */



const edit = async (id) => {
  if (!id) {
    console.error('Invalid ID');
    return;
  }

  dialogTitle.value = "Ändra produktinformation";

  try {
    const res = await axios.get(`http://localhost:3001/find/${id}`);
    console.log('Fetched data:', res.data);

    product._id = res.data._id;
    product.pid = res.data.pid;
    product.name = res.data.name;
    product.type = res.data.type;
    product.count = res.data.count;
    product.date = res.data.date;
    product.description = res.data.description;

    // Lägg till ytterligare bearbetningslogik här

    dialogVisible.value = true;
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};


const confirmUpdate = async (id, pageInation) => {
  try {
    await axios.put(`http://localhost:3001/update/${id}`, product);
    dialogVisible.value = false;
    ElMessage({
      message: 'Uppdateringen är klar',
      type: 'success'
    });
    // Rensa egenskaperna i produktobjektet
    Object.keys(product).forEach(key => {
      product[key] = '';
    }); 
    pageInation();  // Call pageInation with the provided function
  } catch (error) {
    console.error('Error updating product:', error);
  }
};

const addAndUpdate = async () => {
  dialogVisible.value = false;

  if (dialogTitle.value == "Lägga till produkt information") {
    add(pageInation);
  } else {
    confirmUpdate(product._id, pageInation);
  }
};

const close = async () => {
  if (dialogTitle == "Ändra produktinformation") {
    product.pid = '';
    product.name = '';
    product.type = '';
    product.count = 0;
    product.date = '';
    product.description = '';
  }
  dialogVisible.value = false;
};







const onSubmit = () => {
  console.log('submit!');
};

const pageInation = async () => {
  try {
    const response = await axios.get('http://localhost:3001/foodList', {
      params: {
        currentPage: page.current,
        pageSize: page.size
      }
    });

    foodList.value = response.data.data;
    page.total = response.data.total;

    // Kontrollera om den aktuella sidan är tom och inte den första sidan
    if (foodList.value.length === 0 && page.current > 1) {
      // Om så är fallet, minska den aktuella sidan och ring paInation igen
      page.current = page.current - 1;
      await pageInation();
    }
  } catch (error) {
    console.error('获取数据时发生错误：', error);
  }
};


const currentChange = (currentPage) => {
  console.log(currentPage);
  page.current = currentPage;

  // Paginering för suddig namnfråga:
  if (search.name !== '') {
    axios.get('findByName', {
      params: {
        currentPage: page.current,
        pageSize: page.size,
        names: search.name
      }
    }).then(res => {
      console.log('Luddiga resultat för sökfrågor för namnsökning：');
      console.log(res.data);
      foodList = res.data.data;
      page.total = res.data.total;
    });
    return;
  }
  pageInation();
};
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

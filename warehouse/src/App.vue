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
              <el-select v-model="product.type" placeholder="Produkttyper" clearable :rules="rules.type">
                <el-option label="Spannmålsprodukter" value="Spannmålsprodukter" />
                <el-option label="Stärkelseprodukter" value="Stärkelseprodukter" />
                <el-option label="Vegetabiliska produkter" value="Vegetabiliska produkter" />
                <el-option label="Fruktprodukter" value="Fruktprodukter" />
                <el-option label="Köttprodukter" value="Köttprodukter" />
                <el-option label="Fjäderfäprodukter" value="Fjäderfäprodukter" />
                <el-option label="Äggprodukter" value="Äggprodukter" />
                <el-option label="Mejeriprodukter" value="Mejeriprodukter" />
                <el-option label="Godis" value="Godis" />
                <el-option label="Snacks" value="Snacks" />
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

      <el-form ref="ruleForm" :inline="true" :model="search" class="demo-form-inline">
        <el-form-item label="Produktnummer(ID)" prop="['search', 'pid']">
          <el-input v-model="search.pid" placeholder="Exakt sökning" clearable :rules="rules.pid" />
        </el-form-item>

        <el-form-item label="Produktnamn" prop="['search', 'name']">
          <el-input v-model="search.name" placeholder="Luddig sökning" clearable :rules="rules.name" />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="onSubmit('search')">Söka</el-button>
        </el-form-item>

        <el-form-item>
          <el-button type="success" @click="addInfo">Lägga till</el-button>
        </el-form-item>
      </el-form>

      <el-main>
        <el-table :data="foodList" style="width: 100%">
          <!-- <el-table-column fixed prop="_id" label="ID" /> -->
          <el-table-column fixed prop="pid" label="Produkt ID" />
          <el-table-column prop="name" label="Produkt Namn" />
          <el-table-column prop="type" label="Produkttyper" />
          <el-table-column prop="count" label="Antal produkt" />
          <el-table-column prop="date" label="Hållbarhetstid" :class-name="cellClassName">
            <template v-slot="{ row }">
              <span :style="cellClassName(row)">{{ formatDate(row.date) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="Beskrivning" />
          <el-table-column fixed="right" label="Operationer">
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
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from 'axios';
import { onMounted } from 'vue';
import dayjs from 'dayjs';

const ruleForm = ref({});
const dialogTitle = ref('');
const foodList = ref([]);
const dialogVisible = ref(false);

const search = reactive({
  pid: '',
  name: ''
});

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
    { required: true, message: 'ProduktID får inte vara tomt', trigger: 'blur' },
    { min: 4, max: 5, message: 'ProduktID-längden bör vara 4 till 5 tecken', trigger: 'blur' }
  ],

  name: [
    { required: true, message: 'Produktnamnet får inte vara tomt', trigger: 'blur' },
    { min: 1, max: 50, message: 'Produktnamnslängden bör vara 1 till 50 tecken', trigger: 'blur' }
  ],
  type: [
    { required: true, message: 'Vänligen välj produkttyp', trigger: 'change' }
  ]
});


onMounted(async () => {
  pageInation();
});

const handleClose = (done) => {
  ElMessageBox.confirm('Är du säker på att du vill stänga den här dialogrutan?')
    .then(() => {
      done();
    })
    .catch(() => {
      // catch error
    });
};

const fetch = () => {
  search.name = '';
  page.current = 1;
  pageInation();
};

const addInfo = () => {
  dialogTitle.value = "Lägga till produkt information";
  dialogVisible.value = true;
};

const resetProduct = () => {
  product.pid = '';
  product.name = '';
  product.type = '';
  product.count = 0;
  product.date = '';
  product.description = '';
};


const add = async (pageInation) => {
  try {
    if (!product.pid || !product.name || !product.type) {
      ElMessage.error('Vänligen fyll i produkt-ID, produktnamn och produkttyp');
      return;
    }

    product.date = dayjs(product.date).format('YYYY-MM-DD');

    delete product._id;

    await axios.post('http://localhost:3001/add', product);
    // Rensa informationen i inmatningsrutan:
    resetProduct();

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
  if (id) {
    // Visa bekräftelsedialog
    ElMessageBox.confirm('Är du säker på att du vill radera denna produkt?', 'Varning', {
      confirmButtonText: 'Ja',
      cancelButtonText: 'Nej',
      type: 'warning'
    }).then(async () => {
      console.log('Product ID to be removed:', id);
      await axios.delete(`http://localhost:3001/delete/${id}`);
      console.log('Deleted successfully');
      ElMessage({
        message: 'Radering är klar',
        type: 'success'
      });
      pageInation();
    }).catch(() => {
      // Användaren klickar på avbryt-knappen
      console.log('Radering avbruten');
    });
  } else {
    console.error('Invalid id');
  }
};


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
    product.date = dayjs(product.date).format('YYYY-MM-DD');
    confirmUpdate(product._id, pageInation);
  }
};

const close = async () => {
  if (dialogTitle === "Ändra produktinformation") {
    resetProduct();
  }
  dialogVisible.value = false;
};

const onSubmit = () => {
  if (search.pid !== '' && search.name === '') {
    ruleForm.value.validate((valid) => {
      if (valid) {
        axios.get(`http://localhost:3001/findByPID/${search.pid}`).then((res) => {
          console.log('Sök på produktnummer');
          foodList.value = res.data;
          search.pid = '';
          page.total = 0;
        })
      }
      else {
        ElMessage({
          message: 'Vänligen ange rätt nummer',
          type: 'error'
        });
      }
    })
  }
  else if (search.pid === '' && search.name !== '') {
    ruleForm.value.validate((valid) => {
      if (valid) {
        console.log('Sök efter produktnamn');
        axios
          .get(`http://localhost:3001/findByName/${search.name}`, {
            params: {
              currentPage: page.current,
              pageSize: page.size,
              names: search.name,
            },
          })
          .then((res) => {
            console.log('Sökresultat baserat på produktnamn');
            console.log(res.data);
            foodList.value = res.data.data;
            page.total = res.data.total;
          });
      }
      else {
        ElMessage({
          message: 'Ange inte för konstiga tecken',
          type: 'error'
        });
      }
    })
  }
  else {
    ElMessage({
      message: 'Vänligen ange giltiga tecken',
      type: 'error'
    });
  }
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
    console.error('Ett fel uppstod när data hämtades:', error);
  }
};


const currentChange = (currentPage) => {
  console.log(currentPage);
  page.current = currentPage;

  // Paginering för suddig namnfråga:
  if (search.name !== '') {
    axios.get(`http://localhost:3001/findByName/${search.name}`, {
      params: {
        currentPage: page.current,
        pageSize: page.size,
        names: search.name
      }
    }).then(res => {
      console.log('Luddiga resultat för sökfrågor för namnsökning：');
      console.log(res.data);
      foodList.value = res.data.data;
      page.total = res.data.total;
    });
    return;
  }
  pageInation();
};


const cellClassName = (row) => {
  const cellDate = new Date(row.date);

  // Ensure row.date is a valid date string
  if (isNaN(cellDate.getTime())) {
    return {};
  }

  const currentDate = new Date();
  const dateDifference = Math.ceil((cellDate - currentDate) / (1000 * 60 * 60 * 24));

  return dateDifference === 2 ? { color: 'red' } : {};
};

const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD');
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
  width: auto;
}

.red-text {
  color: red;
}
</style>

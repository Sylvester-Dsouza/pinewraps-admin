import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:3000/api';
let productId: string;

async function testAPI() {
  try {
    // 1. Create a product
    console.log('\n1. Testing Create Product...');
    const createResponse = await fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Chocolate Cake',
        description: 'A delicious chocolate cake for testing',
        basePrice: 99.99,
        sku: 'CAKE-TEST-001',
        category: 'Cakes',
        status: 'draft',
        variants: {
          size: [
            { value: '6 inch', priceAdjustment: 0, stock: 10 },
            { value: '8 inch', priceAdjustment: 20, stock: 5 }
          ],
          flavour: [
            { value: 'Chocolate', priceAdjustment: 0, stock: 10 },
            { value: 'Vanilla', priceAdjustment: 5, stock: 8 }
          ]
        }
      })
    });
    const createData = await createResponse.json();
    console.log('Create Product Response:', createData);
    productId = createData.product.id;

    // 2. Get all products
    console.log('\n2. Testing Get All Products...');
    const listResponse = await fetch(`${BASE_URL}/products`);
    const listData = await listResponse.json();
    console.log('List Products Response:', listData);

    // 3. Get filtered products
    console.log('\n3. Testing Get Filtered Products...');
    const filteredResponse = await fetch(
      `${BASE_URL}/products?status=draft&category=Cakes&page=1&limit=10`
    );
    const filteredData = await filteredResponse.json();
    console.log('Filtered Products Response:', filteredData);

    // 4. Get single product
    console.log('\n4. Testing Get Single Product...');
    const getResponse = await fetch(`${BASE_URL}/products/${productId}`);
    const getData = await getResponse.json();
    console.log('Get Product Response:', getData);

    // 5. Update product
    console.log('\n5. Testing Update Product...');
    const updateResponse = await fetch(`${BASE_URL}/products/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Updated Chocolate Cake',
        basePrice: 109.99,
        status: 'published'
      })
    });
    const updateData = await updateResponse.json();
    console.log('Update Product Response:', updateData);

    // 6. Upload media
    console.log('\n6. Testing Upload Media...');
    const formData = new FormData();
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    
    if (fs.existsSync(testImagePath)) {
      formData.append('file', fs.createReadStream(testImagePath));
      formData.append('order', '1');

      const uploadResponse = await fetch(`${BASE_URL}/products/${productId}/media`, {
        method: 'POST',
        body: formData
      });
      const uploadData = await uploadResponse.json();
      console.log('Upload Media Response:', uploadData);

      // 7. Reorder media
      if (uploadData.media?.id) {
        console.log('\n7. Testing Reorder Media...');
        const reorderResponse = await fetch(`${BASE_URL}/products/${productId}/media`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mediaOrder: [
              { mediaId: uploadData.media.id, order: 1 }
            ]
          })
        });
        const reorderData = await reorderResponse.json();
        console.log('Reorder Media Response:', reorderData);

        // 8. Delete media
        console.log('\n8. Testing Delete Media...');
        const deleteMediaResponse = await fetch(
          `${BASE_URL}/products/${productId}/media/${uploadData.media.id}`,
          { method: 'DELETE' }
        );
        const deleteMediaData = await deleteMediaResponse.json();
        console.log('Delete Media Response:', deleteMediaData);
      }
    } else {
      console.log('Skipping media tests - test image not found');
    }

    // 9. Delete product
    console.log('\n9. Testing Delete Product...');
    const deleteResponse = await fetch(`${BASE_URL}/products/${productId}`, {
      method: 'DELETE'
    });
    const deleteData = await deleteResponse.json();
    console.log('Delete Product Response:', deleteData);

  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the tests
testAPI().then(() => console.log('\nTests completed!'));

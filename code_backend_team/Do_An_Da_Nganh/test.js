const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("⏳ Đang kết nối tới Database Neon...");

    // Truy vấn thử bảng 'users' (Dựa vào 'model users' trong schema)
    const allUsers = await prisma.users.findMany();
    
    // Truy vấn thử bảng 'rooms' (Dựa vào 'model rooms' trong schema)
    const allRooms = await prisma.rooms.findMany();

    console.log("✅ KẾT NỐI THÀNH CÔNG!");
    console.log(`-> Số lượng User hiện có: ${allUsers.length}`);
    console.log(`-> Số lượng Room hiện có: ${allRooms.length}`);

    if (allUsers.length === 0) {
      console.log("💡 Mẹo: Database đã thông, nhưng bảng đang trống. Hãy viết API để thêm dữ liệu nhé!");
    } else {
      console.log("Dữ liệu Users:", allUsers);
    }

  } catch (error) {
    console.error("❌ LỖI THỰC THI:", error.message);
  } finally {
    // Luôn nhớ ngắt kết nối sau khi dùng xong
    await prisma.$disconnect();
  }
}

main();
const { JSDOM } = require("jsdom");
const fs = require("fs");

const url =
  "https://masothue.com/3002273706-cong-ty-tnhh-thuong-mai-va-dich-vu-ky-thuat-co-dien-hong-son-thuy";

fetch(url)
  .then((response) => response.text())
  .then((html) => {
    const { document } = new JSDOM(html).window;

    const table1 = document.querySelector(".table-taxinfo");
    const table2 = document.querySelector(".table");

    const data1 = {};
    const data2 = {};

    if (table1) {
      const rows1 = table1.querySelectorAll("tr");

      rows1.forEach((row) => {
        const cells = row.querySelectorAll("td");

        if (cells.length === 2) {
          const key = cells[0]?.textContent?.trim();
          const value =
            cells?.[1]?.textContent ||
            cells?.[1]?.querySelector(".copy")?.textContent?.trim();

          data1[key] = value;
        }
      });
    } else {
      console.log("Không tìm thấy bảng dữ liệu 1.");
    }

    if (table2) {
      const rows2 = table2.querySelectorAll("tr");

      rows2.forEach((row) => {
        const cells = row.querySelectorAll("td");

        if (cells.length === 2) {
          const key = cells[0]?.textContent?.trim();
          const value =
            cells?.[1]?.textContent.trim() ||
            cells?.[1]?.querySelector(".copy")?.textContent?.trim();

          data2[key] = value;
        }
      });
    } else {
      console.log("Không tìm thấy bảng dữ liệu 2.");
    }

    fs.writeFileSync(
      url.split("/").slice(-1).pop().replace(/-/g, "_") + ".json",
      JSON.stringify({ companyInfo: data1, industryInfo: data2 }, null, 2)
    );
  })

  .catch((error) => {
    console.error("Lỗi khi lấy dữ liệu:", error);
  });

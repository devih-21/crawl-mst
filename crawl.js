const { JSDOM } = require("jsdom");
const fs = require("fs");

const mainURL = "https://masothue.com";

const urlProvide = "https://masothue.com/tra-cuu-ma-so-thue-theo-tinh/ha-noi-7";

const getListPaging = async () => {
  let listPaging = await fetch(urlProvide)
    .then((response) => response.text())
    .then((html) => {
      let listPaging = [];
      const { document } = new JSDOM(html).window;
      const uiTablePagination = document.querySelector(".page-numbers");
      const pagination = uiTablePagination.querySelectorAll("li");
      for (let i = 0; i < pagination.length; i++) {
        listPaging.push(pagination[i].textContent);
      }
      return listPaging;
    });
  return listPaging;
};

const getListCompany = async (listPaging) => {
  let listCompany = await Promise.all(
    listPaging.map(async (page) => {
      const response = await fetch(urlProvide + "?page=" + page);
      const html = await response.text();
      const { document } = new JSDOM(html).window;
      let companyList = [];
      console.log("page", page);
      let domCompany = document.querySelector(".tax-listing");
      let linkDOM = domCompany.querySelectorAll("h3");
      for (let i = 0; i < linkDOM.length; i++) {
        companyList.push(
          mainURL + linkDOM[i].getElementsByTagName("a")[0].href
        );
      }

      return companyList;
    })
  );

  return listCompany.flat();
};

const getCompanyInfoByUrl = async (url) => {
  await fetch(url)
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
        "./result/" +
          url.split("/").slice(-1).pop().replace(/-/g, "_") +
          ".json",
        JSON.stringify({ companyInfo: data1, industryInfo: data2 }, null, 2)
      );
    })
    .catch((error) => {
      console.error("Lỗi khi lấy dữ liệu:", error);
    });
};

const main = async () => {
  const listPaging = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  ];
  // const listPaging = await getListPaging();
  const listCompany = await getListCompany(listPaging);

  await Promise.all(
    listCompany.map(async (company) => {
      await getCompanyInfoByUrl(company);
    })
  );
};

main();

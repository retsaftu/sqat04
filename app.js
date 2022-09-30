const { Builder, By, Key, until } = require('selenium-webdriver')
const chrome = require('selenium-webdriver/chrome')
const fs = require("fs");
require('dotenv').config();

let url = `https://github.com/retsaftu/sqat04`

let signInHrefXpath = `/html/body/div[1]/header/div/div[2]/div/div/div[2]/a`
let emailXpath = `//*[@id="login_field"]`;
let passwordXpath = `//*[@id="password"]`;

let continueXpath = `//*[@id="login"]/div[4]/form/div/input[11]`

let addFilesXpath = `//*[@id="repo-content-pjax-container"]/div/div/div[3]/div[1]/div[2]/details/summary`
let createNewFileXpath = `//*[@id="repo-content-pjax-container"]/div/div/div[3]/div[1]/div[2]/details/div/ul/li[3]/form/button`
let newFileNameXpath = `//*[@id="repo-content-pjax-container"]/div/div/form[2]/div/div[1]/span/input`
let fileContentXpath = `//*[@id="code-editor"]/div/pre/span`;

let commitNameXpath = `//*[@id="commit-summary-input"]`
let commitAdd = `add new file ${process.env.NEW_FILE_NAME} from ${process.env.FROM_FILE_NAME}`
let commitAdd_M = `BTW this file ${process.env.NEW_FILE_NAME} add from this script ${process.env.FROM_FILE_NAME}`
let commit_M = `//*[@id="commit-description-textarea"]`
let commitNewFileXpath = `//*[@id="submit-file"]`
// let user = {
//     email: process.env.USER_EMAIL,
//     password: process.env.USER_PASSWORD
// }
let fromFile;




class Commit {
    constructor(driver, newFileName, fromFileName) {
        this.driver = driver
        this.newFileName = newFileName
        this.fromFileName = fromFileName
    }
    async add() {
        await this.driver.findElement(By.xpath(newFileNameXpath)).sendKeys(process.env.NEW_FILE_NAME);//send file name
        await this.driver.sleep(3000)
        await this.driver.findElement(By.xpath(fileContentXpath)).click();
        await this.driver.sleep(1000)

        await this.driver.findElement(By.xpath(fileContentXpath)).sendKeys(fromFile);//send file content
        await this.driver.sleep(5000)


        await this.driver.findElement(By.xpath(commitNameXpath)).sendKeys(commitAdd);//add commit 
        await this.driver.findElement(By.xpath(commit_M)).sendKeys(commitAdd_M);//add description
        await this.driver.sleep(5000)

        await this.driver.findElement(By.xpath(commitNewFileXpath)).click();//push
    }
}
class Login {
    constructor(driver) {
        this.driver = driver
    }

    async login() {
        //for POM model
        let routing = new Routing(this.driver);
        let user = new User(this.driver, process.env.USER_EMAIL, process.env.USER_PASSWORD);
        let general = new General(this.driver)


        await routing.signIn();
        // await this.driver.findElement(By.xpath(signInHrefXpath)).click()

        await general.sleep(3000)
        // console.log(`fn`, fn);
        // console.log(`user.getUser().email`, user.getUser().email);
        await this.driver.findElement(By.xpath(emailXpath)).sendKeys(user.getUser().email);//send email

        await this.driver.findElement(By.xpath(passwordXpath)).sendKeys(user.getUser().password);//send password
        await general.sleep(4000)
        await routing.continue()


    }
}
class Routing {

    constructor(driver) {
        this.driver = driver
    }
    async signIn() {//go to login page
        await this.driver.findElement(By.xpath(signInHrefXpath)).click()
    }

    async continue() {//continue login
        await this.driver.findElement(By.xpath(continueXpath)).click()
    }

    async createFile() {//route to create file
        await this.driver.findElement(By.xpath(addFilesXpath)).click()
        await this.driver.sleep(1000)
        await this.driver.findElement(By.xpath(createNewFileXpath)).click()
        await this.driver.sleep(3000)
    }
}

class User {

    constructor(driver, email, password) {
        this.driver = driver
        this.email = email
        this.password = password
    }
    getUser() {//return user
        return {
            email: this.email,
            password: this.password,
        }
    }
}


class General {
    constructor(driver) {
        this.driver = driver
    }

    async sleep(time) {
        await this.driver.sleep(time)
    }
}




async function start() {
    fromFile = await readFile();

    const options = new chrome.Options()

    options.addArguments('--disable-dev-shm-usage')
    options.addArguments('--no-sandbox')
    options.addArguments("--window-size=1100,1000")

    const driver = new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build()
    console.log(`fromFile`, fromFile);
    try {
        await driver.get(url)
        let general = new General(driver);
        await general.sleep(5000);
        let login = new Login(driver)
        let routing = new Routing(driver)
        let commit = new Commit(driver, process.env.NEW_FILE_NAME, process.env.FROM_FILE_NAME)
        await login.login()
        await general.sleep(5000);
        await routing.createFile();
        await general.sleep(3000);
        await commit.add();
        await driver.sleep(3000)





        await driver.sleep(5000)
        await driver.quit()
    } catch (error) {
        await driver.quit()

        console.log(`error`, error);

    }

}
async function readFile() {

    let fileContent = await fs.readFileSync(process.env.FROM_FILE_NAME, "utf8");
    // console.log(fileContent);
    return fileContent
}
start()